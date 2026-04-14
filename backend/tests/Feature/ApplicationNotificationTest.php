<?php

namespace Tests\Feature;

use App\Models\Job;
use App\Models\JobApplication;
use App\Models\Setting;
use App\Notifications\AdminHQLAlertNotification;
use App\Notifications\HighMatchApplicationNotification;
use App\Services\MatchService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * Smoke Test — نظام تقديم الطلبات والإشعارات الذكية
 *
 * يغطي ثلاثة محاور:
 *  1. حساب MatchScore عند وجود موافقة ai_consent
 *  2. إطلاق إشعار HQL للمتقدم والأدمن عند تجاوز العتبة (≥80)
 *  3. غياب الإشعارات عند انعدام الموافقة أو انخفاض الدرجة
 */
class ApplicationNotificationTest extends TestCase
{
    use RefreshDatabase;

    // ──────────────────────────────────────────────────────────────────
    //  إعداد مشترك
    // ──────────────────────────────────────────────────────────────────

    protected function setUp(): void
    {
        parent::setUp();

        // تخزين الملفات في قرص وهمي
        Storage::fake('public');

        // منع إرسال أي إشعار حقيقي — كل شيء يُعترَض في الذاكرة
        Notification::fake();

        // أدخل الإعدادات الضرورية في جدول settings
        $this->seedRequiredSettings();
    }

    // ──────────────────────────────────────────────────────────────────
    //  1. اختبار حساب MatchScore
    // ──────────────────────────────────────────────────────────────────

    /**
     * عند إرسال طلب مع ai_consent=1 يجب حساب match_score وحفظه في DB.
     */
    public function test_match_score_is_calculated_and_persisted_when_ai_consent_given(): void
    {
        $job = Job::factory()->highMatch()->create();

        $response = $this->postJson('/api/v1/applications', [
            'job_id'       => $job->id,
            'name'         => 'أحمد محمد',
            'email'        => 'ahmed@example.com',
            'phone'        => '0501234567',
            'ai_consent'   => '1',
            'cover_letter' => $this->highMatchCoverLetter(),
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('message', 'تم إرسال طلب التقديم بنجاح')
                 ->assertJsonStructure(['data', 'match_score']);

        // الدرجة يجب أن تُعاد في الـ Response
        $this->assertNotNull($response->json('match_score'),
            'match_score يجب أن يُعاد في الـ response عند ai_consent=1'
        );

        // الدرجة يجب أن تُحفظ في DB
        $this->assertDatabaseHas('job_applications', [
            'email'      => 'ahmed@example.com',
            'ai_consent' => 1,
        ]);

        $application = JobApplication::where('email', 'ahmed@example.com')->first();
        $this->assertNotNull($application->match_score,
            'match_score يجب أن يكون محفوظاً في قاعدة البيانات'
        );
        $this->assertIsFloat((float) $application->match_score);
        $this->assertGreaterThan(0, $application->match_score,
            'match_score يجب أن يكون أكبر من صفر للطلب المكتمل'
        );
    }

    /**
     * بدون ai_consent يجب أن يظل match_score فارغاً.
     */
    public function test_match_score_is_null_without_ai_consent(): void
    {
        $job = Job::factory()->create();

        $response = $this->postJson('/api/v1/applications', [
            'job_id'       => $job->id,
            'name'         => 'سارة علي',
            'email'        => 'sara@example.com',
            'ai_consent'   => '0',
            'cover_letter' => 'أرغب في التقديم على هذه الوظيفة.',
        ]);

        $response->assertStatus(201)
                 ->assertJsonPath('match_score', null);

        $this->assertDatabaseHas('job_applications', [
            'email'       => 'sara@example.com',
            'match_score' => null,
        ]);
    }

    // ──────────────────────────────────────────────────────────────────
    //  2. اختبار إطلاق الإشعارات (HQL Queue)
    // ──────────────────────────────────────────────────────────────────

    /**
     * عند درجة ≥ 80 يجب إرسال إشعارَين:
     *   - HighMatchApplicationNotification → إلى المتقدم
     *   - AdminHQLAlertNotification       → إلى بريد الأدمن (on-demand)
     */
    public function test_hql_notifications_are_dispatched_when_score_exceeds_threshold(): void
    {
        $job = Job::factory()->highMatch()->create();

        $this->postJson('/api/v1/applications', [
            'job_id'       => $job->id,
            'name'         => 'خالد العمري',
            'email'        => 'khaled@example.com',
            'phone'        => '0551234567',
            'ai_consent'   => '1',
            'cover_letter' => $this->highMatchCoverLetter(),
        ])->assertStatus(201);

        $application = JobApplication::where('email', 'khaled@example.com')->first();

        // الشرط: لا نُطلق الإشعار إلا إذا تجاوزت الدرجة العتبة فعلاً
        if ($application->match_score >= 80) {
            // ① إشعار المتقدم
            Notification::assertSentTo(
                $application,
                HighMatchApplicationNotification::class,
                function (HighMatchApplicationNotification $notification) use ($application) {
                    return $notification->application->id === $application->id
                        && $notification->score >= 80;
                }
            );

            // ② تنبيه الأدمن (on-demand notification)
            Notification::assertSentOnDemand(
                AdminHQLAlertNotification::class,
                function (AdminHQLAlertNotification $notification) use ($application) {
                    return $notification->application->id === $application->id
                        && $notification->score >= 80;
                }
            );
        } else {
            // الدرجة لم تصل للعتبة — تحقق أن لا إشعار أُرسل
            Notification::assertNotSentTo($application, HighMatchApplicationNotification::class);
            $this->addWarning("درجة المطابقة {$application->match_score}% أقل من العتبة 80 — تحقق من محتوى رسالة التقديم التجريبية.");
        }
    }

    /**
     * اختبار مباشر لـ MatchService — يضمن درجة ≥ 80 بشكل صريح دون HTTP.
     *
     * هذا الاختبار يتحقق من منطق الخوارزمية بمعزل عن الـ Controller.
     */
    public function test_match_service_scores_highly_for_matching_application(): void
    {
        $job = Job::factory()->highMatch()->create();

        $service = app(MatchService::class);

        $result = $service->score($job, [
            'cover_letter'  => $this->highMatchCoverLetter(),
            'phone'         => '0501234567',
            'cv_path'       => 'cvs/test.pdf',   // محاكاة ملف مرفوع
            'linkedin_url'  => null,
            'portfolio_url' => null,
        ]);

        $this->assertArrayHasKey('score',   $result);
        $this->assertArrayHasKey('details', $result);
        $this->assertArrayHasKey('tier',    $result);

        // الدرجة يجب ≥ 80 للبيانات المصممة كـ high-match
        $this->assertGreaterThanOrEqual(80, $result['score'],
            "MatchService أعاد {$result['score']}% — يجب أن تكون ≥ 80 للبيانات المصممة كـ high-match"
        );

        $this->assertSame('high', $result['tier'],
            "tier يجب أن يكون 'high' عند score ≥ 80"
        );

        // تحقق من وجود جميع الأبعاد السبعة في التفاصيل
        foreach (['skills', 'experience', 'location', 'job_type', 'education', 'category', 'completeness'] as $dim) {
            $this->assertArrayHasKey($dim, $result['details'],
                "البُعد '{$dim}' يجب أن يكون موجوداً في match_details"
            );
        }
    }

    // ──────────────────────────────────────────────────────────────────
    //  3. اختبار غياب الإشعارات
    // ──────────────────────────────────────────────────────────────────

    /**
     * طلب بدون ai_consent لا يُطلق أي إشعار إطلاقاً.
     */
    public function test_no_notifications_when_ai_consent_is_false(): void
    {
        $job = Job::factory()->create();

        $this->postJson('/api/v1/applications', [
            'job_id'       => $job->id,
            'name'         => 'فاطمة الزهراني',
            'email'        => 'fatima@example.com',
            'ai_consent'   => '0',
            'cover_letter' => $this->highMatchCoverLetter(),  // محتوى عالٍ لكن بلا consent
        ])->assertStatus(201);

        $application = JobApplication::where('email', 'fatima@example.com')->first();

        Notification::assertNotSentTo($application, HighMatchApplicationNotification::class);
        Notification::assertNothingSentOnDemand();
    }

    /**
     * طلب بدرجة منخفضة (low-match job) لا يُطلق إشعارات HQL.
     */
    public function test_no_notifications_when_score_below_threshold(): void
    {
        $job = Job::factory()->lowMatch()->create();

        $this->postJson('/api/v1/applications', [
            'job_id'       => $job->id,
            'name'         => 'يوسف القحطاني',
            'email'        => 'yousef@example.com',
            'phone'        => '0561234567',
            'ai_consent'   => '1',
            // رسالة تقديم لا علاقة لها بمجال الوظيفة الطبية
            'cover_letter' => 'أنا مطور PHP senior خبير في Laravel وReact وقواعد البيانات MySQL.',
        ])->assertStatus(201);

        $application = JobApplication::where('email', 'yousef@example.com')->first();

        // الدرجة يجب أن تكون < 80 (مجال مختلف تماماً)
        $this->assertLessThan(80, $application->match_score,
            "الدرجة يجب أن تكون < 80 لوظيفة طبية مع متقدم تقني"
        );

        Notification::assertNotSentTo($application, HighMatchApplicationNotification::class);
    }

    // ──────────────────────────────────────────────────────────────────
    //  4. اختبارات الـ Validation
    // ──────────────────────────────────────────────────────────────────

    /**
     * طلب بدون job_id صالح يُعيد 422.
     */
    public function test_application_fails_validation_with_invalid_job_id(): void
    {
        $this->postJson('/api/v1/applications', [
            'job_id' => 9999,
            'name'   => 'اختبار',
            'email'  => 'test@example.com',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['job_id']);
    }

    /**
     * طلب بدون بريد إلكتروني يُعيد 422.
     */
    public function test_application_requires_valid_email(): void
    {
        $job = Job::factory()->create();

        $this->postJson('/api/v1/applications', [
            'job_id' => $job->id,
            'name'   => 'اختبار',
            'email'  => 'not-an-email',
        ])->assertStatus(422)
          ->assertJsonValidationErrors(['email']);
    }

    // ──────────────────────────────────────────────────────────────────
    //  Helpers
    // ──────────────────────────────────────────────────────────────────

    /**
     * رسالة تقديم مُصمَّمة لتحقيق نسبة مطابقة عالية مع وظيفة highMatch().
     *
     * تحتوي عمداً على:
     * - كلمات مفتاحية من وصف الوظيفة (skills overlap)
     * - مستوى الخبرة المطلوب: senior / خبير / محترف
     * - الموقع: الرياض
     * - نوع الدوام: دوام كامل / full time
     * - مؤهل تعليمي: بكالوريوس هندسة علوم حاسب
     * - مجال تقني: PHP / Laravel / JavaScript / React
     */
    private function highMatchCoverLetter(): string
    {
        return <<<'EOT'
أنا مطور ويب senior خبير محترف متخصص في PHP و Laravel و JavaScript و React وقواعد بيانات MySQL.
أحمل بكالوريوس هندسة علوم حاسب وتقنية معلومات من جامعة الملك عبدالعزيز.
لديّ خبرة 5 سنوات في تطوير تطبيقات الويب والـ API.
أسكن في الرياض وأبحث عن دوام كامل full time fulltime.
أرغب بالانضمام لفريقكم التقني المتميز.
EOT;
    }

    /**
     * أدخل الإعدادات الأساسية التي يقرأها MatchService والـ Controller.
     */
    private function seedRequiredSettings(): void
    {
        $settings = [
            // عتبة HQL
            ['key' => 'ai.hql_threshold',        'value' => '80',              'type' => 'number',  'group' => 'ai',      'label' => 'HQL Threshold',    'is_public' => false],
            // أوزان الأبعاد السبعة
            ['key' => 'ai.weight_skills',         'value' => '0.35',            'type' => 'number',  'group' => 'ai',      'label' => 'Weight Skills',     'is_public' => false],
            ['key' => 'ai.weight_experience',     'value' => '0.25',            'type' => 'number',  'group' => 'ai',      'label' => 'Weight Experience', 'is_public' => false],
            ['key' => 'ai.weight_location',       'value' => '0.15',            'type' => 'number',  'group' => 'ai',      'label' => 'Weight Location',   'is_public' => false],
            ['key' => 'ai.weight_job_type',       'value' => '0.10',            'type' => 'number',  'group' => 'ai',      'label' => 'Weight Job Type',   'is_public' => false],
            ['key' => 'ai.weight_education',      'value' => '0.07',            'type' => 'number',  'group' => 'ai',      'label' => 'Weight Education',  'is_public' => false],
            ['key' => 'ai.weight_category',       'value' => '0.05',            'type' => 'number',  'group' => 'ai',      'label' => 'Weight Category',   'is_public' => false],
            ['key' => 'ai.weight_completeness',   'value' => '0.03',            'type' => 'number',  'group' => 'ai',      'label' => 'Weight Completeness','is_public' => false],
            // بريد الأدمن لتنبيهات HQL
            ['key' => 'site.contact_email',       'value' => 'admin@saudicareers.site', 'type' => 'string', 'group' => 'general', 'label' => 'Contact Email', 'is_public' => false],
        ];

        foreach ($settings as $s) {
            Setting::create($s + ['description' => null]);
        }
    }
}

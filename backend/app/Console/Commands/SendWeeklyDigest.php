<?php

namespace App\Console\Commands;

use App\Models\Job;
use App\Models\JobAlert;
use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Mail;

class SendWeeklyDigest extends Command
{
    protected $signature   = 'send:weekly-digest';
    protected $description = 'Send weekly job digest email to users with active alerts';

    public function handle(): int
    {
        $since  = now()->subDays(7);
        $sent   = 0;
        $failed = 0;

        // Group active alerts by user
        $alertsByUser = JobAlert::where('active', true)
            ->with('user')
            ->get()
            ->filter(fn ($a) => $a->user && $a->user->email)
            ->groupBy('user_id');

        if ($alertsByUser->isEmpty()) {
            $this->info('No active alerts.');
            return self::SUCCESS;
        }

        $allJobs = Job::where('is_active', true)
            ->where('created_at', '>=', $since)
            ->orderByDesc('created_at')
            ->limit(200)
            ->get(['id', 'title', 'company', 'location', 'category', 'salary_min', 'salary_max']);

        foreach ($alertsByUser as $userId => $alerts) {
            $user = $alerts->first()->user;

            // Collect matching jobs (up to 5) across all user alerts
            $matched = collect();
            foreach ($alerts as $alert) {
                foreach ($allJobs as $job) {
                    if ($matched->contains('id', $job->id)) continue;
                    if ($this->matches($alert, $job)) {
                        $matched->push($job);
                        if ($matched->count() >= 5) break 2;
                    }
                }
            }

            if ($matched->isEmpty()) continue;

            $html = $this->buildHtml($user, $matched);

            try {
                $this->sendEmail($user->email, $user->name ?? 'عزيزي المستخدم', $html);
                $sent++;
                $this->line("  ✓ {$user->email}");
            } catch (\Throwable $e) {
                $failed++;
                $this->warn("  ✗ {$user->email}: " . $e->getMessage());
            }
        }

        $this->info("Digest done — sent: {$sent}, failed: {$failed}");
        return self::SUCCESS;
    }

    private function matches(JobAlert $alert, Job $job): bool
    {
        if ($alert->keyword) {
            $kw = mb_strtolower($alert->keyword);
            if (!str_contains(mb_strtolower($job->title . ' ' . $job->company), $kw)) return false;
        }
        if ($alert->location) {
            if (!str_contains(mb_strtolower($job->location ?? ''), mb_strtolower($alert->location))) return false;
        }
        if ($alert->category && $alert->category !== '') {
            if ($job->category !== $alert->category) return false;
        }
        return true;
    }

    private function buildHtml(User $user, $jobs): string
    {
        $name  = htmlspecialchars($user->name ?? 'عزيزي المستخدم');
        $cards = '';
        foreach ($jobs as $job) {
            $title   = htmlspecialchars($job->title);
            $company = htmlspecialchars($job->company);
            $loc     = htmlspecialchars($job->location ?? '');
            $url     = "https://saudicareers.site/jobs/{$job->id}";
            $salary  = ($job->salary_min && $job->salary_max)
                ? number_format($job->salary_min) . ' - ' . number_format($job->salary_max) . ' ر.س'
                : '';
            $cards .= <<<CARD
            <div style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:16px 20px;margin-bottom:12px;">
              <div style="font-size:15px;font-weight:700;color:#0f172a;margin-bottom:4px;">{$title}</div>
              <div style="font-size:13px;color:#64748b;margin-bottom:8px;">{$company} · {$loc}</div>
              {$salary}<br>
              <a href="{$url}" style="display:inline-block;margin-top:10px;background:#006644;color:#fff;padding:8px 18px;border-radius:8px;text-decoration:none;font-size:13px;font-weight:600;">عرض الوظيفة</a>
            </div>
            CARD;
        }

        return <<<HTML
        <!DOCTYPE html>
        <html lang="ar" dir="rtl">
        <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
        <body style="background:#f8fafc;font-family:'Segoe UI',Tahoma,Arial,sans-serif;margin:0;padding:24px;">
          <div style="max-width:560px;margin:0 auto;">
            <div style="text-align:center;margin-bottom:24px;">
              <img src="https://saudicareers.site/saudi.png" width="40" height="40" alt="Saudi Careers" style="border-radius:8px;">
              <h1 style="font-size:22px;font-weight:800;color:#006644;margin:12px 0 4px;">ملخصك الأسبوعي</h1>
              <p style="color:#64748b;font-size:14px;margin:0;">مرحباً {$name}، إليك أحدث الوظائف المطابقة لاهتماماتك</p>
            </div>
            {$cards}
            <div style="text-align:center;margin-top:24px;">
              <a href="https://saudicareers.site" style="background:#006644;color:#fff;padding:12px 32px;border-radius:10px;text-decoration:none;font-size:14px;font-weight:700;">عرض الكل</a>
            </div>
            <p style="text-align:center;font-size:11px;color:#94a3b8;margin-top:24px;">
              لإلغاء الاشتراك في التنبيهات: <a href="https://saudicareers.site/alerts" style="color:#006644;">إدارة التنبيهات</a>
            </p>
          </div>
        </body>
        </html>
        HTML;
    }

    private function sendEmail(string $to, string $name, string $html): void
    {
        $apiKey = config('services.resend.key');

        if ($apiKey) {
            // Send via Resend API
            $response = Http::withToken($apiKey)
                ->post('https://api.resend.com/emails', [
                    'from'    => 'Saudi Careers <noreply@saudicareers.site>',
                    'to'      => [$to],
                    'subject' => 'ملخصك الأسبوعي — أحدث وظائف سعودي كاريرز',
                    'html'    => $html,
                ]);

            if (!$response->successful()) {
                throw new \RuntimeException('Resend error: ' . $response->body());
            }
            return;
        }

        // Fallback: Laravel SMTP
        Mail::html($html, function ($msg) use ($to, $name) {
            $msg->to($to, $name)
                ->subject('ملخصك الأسبوعي — أحدث وظائف سعودي كاريرز');
        });
    }
}

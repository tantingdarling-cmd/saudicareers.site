<?php

namespace App\Notifications;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * إشعار للمتقدم عند حصوله على نسبة مطابقة عالية (High Match).
 * يُرسل فقط إذا وافق على consent_v2 (ai_consent = true).
 * يُنفَّذ عبر Queue لضمان سرعة الاستجابة.
 */
class HighMatchApplicationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly JobApplication $application,
        public readonly Job            $job,
        public readonly float          $score,
    ) {
        $this->onQueue('notifications');
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $tier      = $this->tier();
        $scoreInt  = (int) round($this->score);
        $jobUrl    = config('app.url') . '/jobs/' . ($this->job->slug ?? $this->job->id);
        $privacyUrl = config('app.url') . '/privacy';

        return (new MailMessage)
            ->subject("🎯 طلبك على وظيفة \"{$this->job->title}\" — تم استلامه بنجاح")
            ->view('emails.high_match', [
                'applicantName' => $this->application->name,
                'jobTitle'      => $this->job->title,
                'company'       => $this->job->company,
                'location'      => $this->job->location,
                'score'         => $scoreInt,
                'tier'          => $tier,
                'jobUrl'        => $jobUrl,
                'privacyUrl'    => $privacyUrl,
            ]);
    }

    private function tier(): array
    {
        if ($this->score >= 85) return ['label' => 'ممتاز', 'color' => '#065F46', 'bg' => '#D1FAE5', 'emoji' => '🏆'];
        if ($this->score >= 80) return ['label' => 'عالي',  'color' => '#065F46', 'bg' => '#D1FAE5', 'emoji' => '⭐'];
        return                         ['label' => 'جيد',   'color' => '#92400E', 'bg' => '#FEF3C7', 'emoji' => '👍'];
    }
}

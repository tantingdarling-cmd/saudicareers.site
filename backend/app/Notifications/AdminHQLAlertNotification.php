<?php

namespace App\Notifications;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * تنبيه للأدمن عند وصول مرشح بنسبة مطابقة عالية (HQL).
 * يُرسل لبريد الإدارة المخزّن في settings (site.contact_email).
 */
class AdminHQLAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public readonly JobApplication $application,
        public readonly Job            $job,
        public readonly float          $score,
        public readonly array          $details = [],
    ) {
        $this->onQueue('notifications');
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $scoreInt   = (int) round($this->score);
        $adminUrl   = config('app.url') . '/admin';
        $privacyUrl = config('app.url') . '/privacy';

        return (new MailMessage)
            ->subject("🤖 HQL Alert: مرشح بنسبة {$scoreInt}% — {$this->job->title}")
            ->view('emails.admin_hql_alert', [
                'applicantName' => $this->application->name,
                'applicantEmail'=> $this->application->email,
                'applicantPhone'=> $this->application->phone,
                'jobTitle'      => $this->job->title,
                'company'       => $this->job->company,
                'score'         => $scoreInt,
                'details'       => $this->details,
                'adminUrl'      => $adminUrl,
                'privacyUrl'    => $privacyUrl,
                'appliedAt'     => now()->format('Y-m-d H:i'),
            ]);
    }
}

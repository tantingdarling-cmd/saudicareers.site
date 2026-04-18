<?php

namespace App\Mail;

use App\Models\Job;
use App\Models\JobAlert;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class JobAlertMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Job      $job,
        public readonly JobAlert $alert,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'وظيفة جديدة تطابق تنبيهك: ' . $this->job->title);
    }

    public function content(): Content
    {
        $job   = $this->job;
        $alert = $this->alert;

        $html = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;direction:rtl;padding:24px;color:#1a1a1a">
  <h2 style="color:#003D2B">وظيفة جديدة تطابق تنبيهك</h2>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:8px 0;font-weight:600">المسمى الوظيفي:</td><td>{$job->title}</td></tr>
    <tr><td style="padding:8px 0;font-weight:600">الشركة:</td><td>{$job->company}</td></tr>
    <tr><td style="padding:8px 0;font-weight:600">الموقع:</td><td>{$job->location}</td></tr>
  </table>
  <p style="margin-top:24px">
    <a href="https://saudicareers.site/jobs/{$job->id}"
       style="background:#003D2B;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none">
      عرض الوظيفة
    </a>
  </p>
  <hr style="margin-top:32px;border:none;border-top:1px solid #eee">
  <p style="font-size:12px;color:#888">
    تم إرسال هذا التنبيه بناءً على كلمة البحث: {$alert->keyword} — الموقع: {$alert->location}
  </p>
</body>
</html>
HTML;

        return new Content(htmlString: $html);
    }
}

<?php

namespace App\Mail;

use App\Models\Job;
use App\Models\JobApplication;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class ApplicationConfirmationMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly JobApplication $application,
        public readonly Job            $job,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(subject: 'تم استلام طلبك: ' . $this->job->title);
    }

    public function content(): Content
    {
        $app      = $this->application;
        $job      = $this->job;
        $trackUrl = 'https://saudicareers.site/track/' . $app->tracking_token;

        $html = <<<HTML
<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head><meta charset="UTF-8"></head>
<body style="font-family:Arial,sans-serif;direction:rtl;padding:24px;color:#1a1a1a">
  <h2 style="color:#003D2B">تم استلام طلبك ✅</h2>
  <p>مرحباً {$app->name}،</p>
  <p>تم استلام طلبك للوظيفة التالية بنجاح:</p>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:8px 0;font-weight:600">المسمى الوظيفي:</td><td>{$job->title}</td></tr>
    <tr><td style="padding:8px 0;font-weight:600">الشركة:</td><td>{$job->company}</td></tr>
    <tr><td style="padding:8px 0;font-weight:600">الموقع:</td><td>{$job->location}</td></tr>
  </table>
  <p style="margin-top:24px">
    <a href="{$trackUrl}"
       style="background:#003D2B;color:#fff;padding:10px 24px;border-radius:8px;text-decoration:none">
      تتبّع حالة طلبك
    </a>
  </p>
  <hr style="margin-top:32px;border:none;border-top:1px solid #eee">
  <p style="font-size:12px;color:#888">سعودي كارييرز — منصة التوظيف السعودية</p>
</body>
</html>
HTML;

        return new Content(htmlString: $html);
    }
}

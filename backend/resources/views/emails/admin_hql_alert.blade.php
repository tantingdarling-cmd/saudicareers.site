<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>HQL Alert — Saudi Careers Admin</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px;">
<tr><td align="center">

  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    {{-- Header --}}
    <tr>
      <td style="background:#003D2B;padding:24px 32px;">
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Saudi<span style="color:#F59E0B;">Careers</span>
                <span style="font-size:13px;font-weight:400;color:rgba(255,255,255,0.6);margin-right:8px;">لوحة التحكم</span>
              </div>
            </td>
            <td align="left">
              <div style="background:#F59E0B;border-radius:6px;padding:6px 12px;display:inline-block;">
                <span style="font-size:12px;font-weight:700;color:#003D2B;">🤖 HQL ALERT</span>
              </div>
            </td>
          </tr>
        </table>
      </td>
    </tr>

    {{-- Alert Banner --}}
    <tr>
      <td style="background:#D1FAE5;padding:16px 32px;border-bottom:2px solid #6EE7B7;">
        <div style="font-size:15px;font-weight:700;color:#065F46;">
          🏆 مرشح ذو جودة عالية — High Quality Lead
        </div>
        <div style="font-size:13px;color:#047857;margin-top:4px;">
          تجاوزت نسبة مطابقته حد الـ HQL المحدد — يُنصح بالمراجعة الفورية
        </div>
      </td>
    </tr>

    {{-- Body --}}
    <tr>
      <td style="padding:28px 32px;">

        {{-- Match Score --}}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#D1FAE5;border-radius:12px;margin-bottom:24px;">
          <tr>
            <td style="padding:20px 24px;">
              <div style="font-size:12px;color:#065F46;font-weight:600;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:6px;">
                نتيجة مطابقة الذكاء الاصطناعي
              </div>
              <div style="display:flex;align-items:baseline;gap:8px;">
                <span style="font-size:52px;font-weight:800;color:#065F46;line-height:1;">{{ $score }}%</span>
                <span style="font-size:16px;font-weight:600;color:#047857;">مطابقة عالية</span>
              </div>
              <div style="background:rgba(0,0,0,0.08);border-radius:4px;height:6px;margin-top:10px;overflow:hidden;">
                <div style="width:{{ $score }}%;height:100%;background:#059669;border-radius:4px;"></div>
              </div>
            </td>
          </tr>
        </table>

        {{-- Applicant Info --}}
        <div style="font-size:14px;font-weight:700;color:#374151;margin-bottom:12px;border-right:3px solid #003D2B;padding-right:10px;">
          بيانات المرشح
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;border-radius:10px;margin-bottom:24px;">
          <tr>
            <td style="padding:16px 20px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6B7280;width:30%;">الاسم</td>
                  <td style="padding:5px 0;font-size:14px;font-weight:600;color:#111827;">{{ $applicantName }}</td>
                </tr>
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6B7280;">البريد</td>
                  <td style="padding:5px 0;font-size:14px;color:#111827;">
                    <a href="mailto:{{ $applicantEmail }}" style="color:#059669;text-decoration:none;">{{ $applicantEmail }}</a>
                  </td>
                </tr>
                @if($applicantPhone)
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6B7280;">الهاتف</td>
                  <td style="padding:5px 0;font-size:14px;color:#111827;">
                    <a href="tel:{{ $applicantPhone }}" style="color:#059669;text-decoration:none;">{{ $applicantPhone }}</a>
                  </td>
                </tr>
                @endif
                <tr>
                  <td style="padding:5px 0;font-size:13px;color:#6B7280;">وقت التقديم</td>
                  <td style="padding:5px 0;font-size:13px;color:#374151;">{{ $appliedAt }}</td>
                </tr>
              </table>
            </td>
          </tr>
        </table>

        {{-- Job Info --}}
        <div style="font-size:14px;font-weight:700;color:#374151;margin-bottom:12px;border-right:3px solid #F59E0B;padding-right:10px;">
          بيانات الوظيفة
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#FFFBEB;border-radius:10px;margin-bottom:24px;">
          <tr>
            <td style="padding:16px 20px;">
              <div style="font-size:16px;font-weight:700;color:#003D2B;">{{ $jobTitle }}</div>
              <div style="font-size:13px;color:#6B7280;margin-top:4px;">{{ $company }}</div>
            </td>
          </tr>
        </table>

        {{-- AI Dimensions Breakdown --}}
        @if(!empty($details))
        <div style="font-size:14px;font-weight:700;color:#374151;margin-bottom:12px;border-right:3px solid #6366F1;padding-right:10px;">
          تفاصيل أبعاد المطابقة
        </div>
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF;border-radius:10px;margin-bottom:24px;">
          <tr>
            <td style="padding:16px 20px;">
              @php
                $dimensionLabels = [
                  'skills'     => 'المهارات التقنية',
                  'experience' => 'الخبرة',
                  'location'   => 'الموقع',
                  'job_type'   => 'نوع الدوام',
                  'education'  => 'التعليم',
                  'category'   => 'القطاع',
                  'completeness'=> 'اكتمال الطلب',
                ];
              @endphp
              @foreach($details as $dim => $val)
              @php
                $label  = $dimensionLabels[$dim] ?? $dim;
                $pct    = is_numeric($val) ? (int)round($val * 100) : 0;
                $barColor = $pct >= 70 ? '#059669' : ($pct >= 40 ? '#D97706' : '#DC2626');
              @endphp
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:10px;">
                <tr>
                  <td style="font-size:12px;color:#4B5563;width:40%;">{{ $label }}</td>
                  <td style="padding:0 12px;">
                    <div style="background:#E5E7EB;border-radius:3px;height:5px;overflow:hidden;">
                      <div style="width:{{ $pct }}%;height:100%;background:{{ $barColor }};border-radius:3px;"></div>
                    </div>
                  </td>
                  <td style="font-size:12px;font-weight:700;color:#374151;width:36px;text-align:left;">{{ $pct }}%</td>
                </tr>
              </table>
              @endforeach
            </td>
          </tr>
        </table>
        @endif

        {{-- CTA --}}
        <table cellpadding="0" cellspacing="0">
          <tr>
            <td style="background:#003D2B;border-radius:8px;padding:14px 28px;">
              <a href="{{ $adminUrl }}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                عرض الطلب في لوحة التحكم ←
              </a>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    {{-- Footer --}}
    <tr>
      <td style="background:#F9FAFB;padding:18px 32px;border-top:1px solid #E5E7EB;text-align:center;">
        <p style="font-size:12px;color:#9CA3AF;margin:0 0 6px;line-height:1.7;">
          هذا التنبيه آلي من نظام AI Matching — سعودي كارييرز.<br/>
          لا تشارك بيانات المرشحين خارج المنظومة وفق <strong>نظام PDPL</strong>.
        </p>
        <p style="font-size:12px;color:#9CA3AF;margin:0;">
          <a href="{{ $privacyUrl }}" style="color:#059669;text-decoration:underline;">سياسة الخصوصية</a>
          &nbsp;·&nbsp;
          <a href="https://saudicareers.site" style="color:#059669;text-decoration:none;">saudicareers.site</a>
        </p>
        <p style="font-size:11px;color:#D1D5DB;margin:8px 0 0;">
          © {{ date('Y') }} Saudi Careers — للاستخدام الداخلي فقط
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>

</body>
</html>

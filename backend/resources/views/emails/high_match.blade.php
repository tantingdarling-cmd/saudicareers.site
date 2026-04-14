<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>طلب التوظيف — سعودي كارييرز</title>
</head>
<body style="margin:0;padding:0;background:#F9FAFB;font-family:'Segoe UI',Tahoma,Arial,sans-serif;direction:rtl;">

<table width="100%" cellpadding="0" cellspacing="0" style="background:#F9FAFB;padding:32px 16px;">
<tr><td align="center">

  {{-- ── بطاقة رئيسية ── --}}
  <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

    {{-- Header --}}
    <tr>
      <td style="background:#003D2B;padding:28px 32px;text-align:center;">
        <div style="font-size:22px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
          Saudi<span style="color:#F59E0B;">Careers</span>
        </div>
        <div style="font-size:13px;color:rgba(255,255,255,0.6);margin-top:4px;">منصة التوظيف الذكية</div>
      </td>
    </tr>

    {{-- Body --}}
    <tr>
      <td style="padding:32px;">

        <p style="font-size:17px;font-weight:600;color:#111827;margin:0 0 8px;">
          مرحباً {{ $applicantName }}،
        </p>
        <p style="font-size:15px;color:#4B5563;line-height:1.8;margin:0 0 24px;">
          وصل طلبك على وظيفة <strong style="color:#003D2B;">{{ $jobTitle }}</strong>
          في <strong>{{ $company }}</strong> — {{ $location }}.
        </p>

        {{-- درجة المطابقة --}}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:{{ $tier['bg'] }};border-radius:12px;margin-bottom:28px;">
          <tr>
            <td style="padding:20px 24px;">
              <div style="font-size:13px;color:{{ $tier['color'] }};font-weight:600;margin-bottom:8px;text-transform:uppercase;letter-spacing:0.5px;">
                {{ $tier['emoji'] }} نتيجة مطابقتك بالذكاء الاصطناعي
              </div>
              <div style="display:flex;align-items:baseline;gap:8px;">
                <span style="font-size:48px;font-weight:800;color:{{ $tier['color'] }};line-height:1;">
                  {{ $score }}%
                </span>
                <span style="font-size:18px;font-weight:700;color:{{ $tier['color'] }};">
                  — {{ $tier['label'] }}
                </span>
              </div>
              {{-- شريط التقدم --}}
              <div style="background:rgba(0,0,0,0.08);border-radius:4px;height:6px;margin-top:12px;overflow:hidden;">
                <div style="width:{{ $score }}%;height:100%;background:{{ $tier['color'] }};border-radius:4px;"></div>
              </div>
            </td>
          </tr>
        </table>

        {{-- ماذا يعني هذا؟ --}}
        <p style="font-size:15px;color:#374151;line-height:1.8;margin:0 0 20px;">
          @if($score >= 85)
            طلبك يُعدّ من الطلبات المميزة. سيتم مراجعته بأولوية عالية من فريق التوظيف.
          @elseif($score >= 80)
            طلبك يوافق بشكل كبير متطلبات الوظيفة. فريق التوظيف سيتواصل معك قريباً.
          @else
            طلبك قيد المراجعة. سنتواصل معك عند وجود تطور.
          @endif
        </p>

        {{-- CTA --}}
        <table cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
          <tr>
            <td style="background:#003D2B;border-radius:8px;padding:14px 28px;">
              <a href="{{ $jobUrl }}" style="color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">
                عرض تفاصيل الوظيفة ←
              </a>
            </td>
          </tr>
        </table>

        {{-- نصائح --}}
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#F3F4F6;border-radius:10px;margin-bottom:24px;">
          <tr>
            <td style="padding:18px 20px;">
              <div style="font-size:13px;font-weight:700;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px;margin-bottom:10px;">
                💡 نصائح لرفع نسبتك في الطلبات القادمة
              </div>
              <ul style="margin:0;padding:0 0 0 20px;color:#4B5563;font-size:13px;line-height:2;">
                <li>أضف كلمات من وصف الوظيفة إلى رسالة تقديمك</li>
                <li>تأكد من ذكر مستوى خبرتك بوضوح</li>
                <li>أرفق سيرة ذاتية محدّثة بصيغة PDF</li>
              </ul>
            </td>
          </tr>
        </table>

      </td>
    </tr>

    {{-- Footer --}}
    <tr>
      <td style="background:#F9FAFB;padding:20px 32px;border-top:1px solid #E5E7EB;text-align:center;">
        <p style="font-size:12px;color:#9CA3AF;margin:0 0 8px;line-height:1.7;">
          هذا الإيميل أُرسل تلقائياً من نظام سعودي كارييرز بعد موافقتك على التحليل بالذكاء الاصطناعي.<br/>
          بياناتك محمية وفق <strong>نظام حماية البيانات الشخصية السعودي (PDPL)</strong>.
        </p>
        <p style="font-size:12px;color:#9CA3AF;margin:0;">
          <a href="{{ $privacyUrl }}" style="color:#059669;text-decoration:underline;">إدارة الخصوصية وسحب الموافقة</a>
          &nbsp;·&nbsp;
          <a href="https://saudicareers.site" style="color:#059669;text-decoration:none;">saudicareers.site</a>
        </p>
        <p style="font-size:11px;color:#D1D5DB;margin:8px 0 0;">
          © {{ date('Y') }} Saudi Careers — جميع الحقوق محفوظة
        </p>
      </td>
    </tr>

  </table>
</td></tr>
</table>

</body>
</html>

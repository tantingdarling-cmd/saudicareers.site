<x-mail::message>
# أهلاً بك في Saudi Careers!

شكراً لتسجيلك في منصتنا. يرجى استخدام الرمز التالي لتأكيد عنوان بريدك الإلكتروني وإكمال عملية التسجيل:

<x-mail::panel>
<div style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
{{ $otp }}
</div>
</x-mail::panel>

هذا الرمز صالح لمدة **15 دقيقة** فقط.

إذا لم تقم بإنشاء حساب في منصتنا، يرجى تجاهل هذه الرسالة.

مع أطيب التحيات،<br>
فريق {{ config('app.name') }}
</x-mail::message>

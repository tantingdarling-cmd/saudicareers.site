<x-mail::message>
# إعادة تعيين كلمة المرور

لقد تلقينا طلباً لإعادة تعيين كلمة مرور حسابك. استخدم الرمز التالي لإتمام العملية:

<x-mail::panel>
<div style="text-align: center; font-size: 24px; font-weight: bold; letter-spacing: 5px;">
{{ $otp }}
</div>
</x-mail::panel>

هذا الرمز صالح لمدة **15 دقيقة** فقط.

إذا لم تطلب إعادة تعيين كلمة المرور، يرجى تجاهل هذه الرسالة.

مع أطيب التحيات،<br>
فريق {{ config('app.name') }}
</x-mail::message>

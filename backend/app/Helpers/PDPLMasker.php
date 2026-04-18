<?php

// 📄 app/Helpers/PDPLMasker.php

namespace App\Helpers;

class PDPLMasker
{
    private const PATTERNS = [
        // هوية وطنية سعودية: 10 أرقام تبدأ بـ 1 أو 2
        '/\b[12]\d{9}\b/'                                                      => '[NATIONAL_ID]',

        // جوال سعودي: 05xxxxxxxx أو +9665xxxxxxxx أو 00966 5xxxxxxxx
        '/(?:\+966|00966|0)5\d{8}\b/'                                          => '[PHONE]',

        // أرقام دولية عامة
        '/\b\+?\d{1,3}[\s.\-]?\(?\d{2,4}\)?[\s.\-]?\d{3,5}[\s.\-]?\d{4}\b/' => '[PHONE]',

        // بريد إلكتروني — يُحتفظ بالدومين لفائدة ATS
        '/\b[a-zA-Z0-9._%+\-]+@([a-zA-Z0-9.\-]+\.[a-zA-Z]{2,})\b/'           => '[EMAIL@$1]',

        // آيبان سعودي
        '/\bSA\d{22}\b/'                                                       => '[IBAN]',

        // أرقام جواز السفر (حرف أو حرفان + 6-9 أرقام)
        '/\b[A-Z]{1,2}\d{6,9}\b/'                                             => '[PASSPORT]',

        // عناوين عربية
        '/(?:شارع|طريق|حي|ش\.|رقم)\s+[\w\s\-]{3,40}(?:،|,|\n|رقم\s+\d+)/u' => '[ADDRESS]',

        // أسماء عربية كاملة (2-4 كلمات عربية متتالية)
        '/\b([\p{Arabic}]{2,15}\s){2,3}[\p{Arabic}]{2,15}\b/u'               => '[FULL_NAME]',
    ];

    public static function mask(string $text): string
    {
        return preg_replace(
            array_keys(self::PATTERNS),
            array_values(self::PATTERNS),
            $text
        ) ?? $text;
    }
}

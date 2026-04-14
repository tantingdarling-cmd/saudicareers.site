<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreResumeRequest extends FormRequest
{
    // §9: Public endpoint — no auth required.
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'file'             => 'required|file|mimes:pdf|max:2048',
            'consent'          => 'required|accepted',           // PDPL: موافقة صريحة إلزامية
            'consent_version'  => 'sometimes|string|max:16',
        ];
    }

    public function messages(): array
    {
        return [
            'file.required'     => 'يرجى رفع ملف السيرة الذاتية',
            'file.mimes'        => 'يجب أن يكون الملف بصيغة PDF',
            'file.max'          => 'حجم الملف يجب أن يكون أقل من 2MB',
            'consent.required'  => 'يجب الموافقة على سياسة الخصوصية قبل التحليل',
            'consent.accepted'  => 'يجب الموافقة على سياسة الخصوصية قبل التحليل',
        ];
    }
}

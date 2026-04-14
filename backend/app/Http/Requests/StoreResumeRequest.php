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
            'file' => 'required|file|mimes:pdf|max:2048', // 2MB, PDF only (Phase 1)
        ];
    }

    public function messages(): array
    {
        return [
            'file.required'  => 'يرجى رفع ملف السيرة الذاتية',
            'file.mimes'     => 'يجب أن يكون الملف بصيغة PDF',
            'file.max'       => 'حجم الملف يجب أن يكون أقل من 2MB',
        ];
    }
}

<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'job_id' => 'required|exists:jobs,id',
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'cv' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
            'cover_letter' => 'nullable|string|max:2000',
            'linkedin_url' => 'nullable|url',
            'portfolio_url' => 'nullable|url',
        ];
    }
    
    public function messages(): array
    {
        return [
            'job_id.required' => 'الوظيفة مطلوبة',
            'job_id.exists' => 'الوظيفة غير موجودة',
            'name.required' => 'الاسم مطلوب',
            'email.required' => 'البريد الإلكتروني مطلوب',
            'email.email' => 'البريد الإلكتروني غير صحيح',
            'cv.mimes' => 'الملف يجب أن يكون PDF أو Word',
            'cv.max' => 'حجم الملف يجب أن يكون أقل من 5MB',
        ];
    }
}

<?php

// app/Http/Requests/ResumeRequest.php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ResumeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'resume_text'     => 'required_without:file|nullable|string|min:100|max:15000',
            'file'            => 'required_without:resume_text|nullable|file|mimes:pdf,txt|max:2048',
            'job_description' => 'nullable|string|max:5000',
            'tier'            => 'nullable|in:free,pro',
            'consent'         => 'required|accepted',
            'consent_version' => 'nullable|string|max:16',
        ];
    }

    public function messages(): array
    {
        return [
            'resume_text.required_without' => 'يرجى إدخال نص السيرة أو رفع ملف PDF/TXT',
            'file.required_without'        => 'يرجى إدخال نص السيرة أو رفع ملف PDF/TXT',
            'resume_text.min'              => 'نص السيرة قصير جداً (الحد الأدنى 100 حرف)',
            'resume_text.max'              => 'نص السيرة طويل جداً (الحد الأقصى 15,000 حرف)',
            'file.mimes'                   => 'يجب أن يكون الملف بصيغة PDF أو TXT',
            'file.max'                     => 'حجم الملف يجب أن يكون أقل من 2MB',
            'consent.required'             => 'يجب الموافقة على سياسة الخصوصية',
            'consent.accepted'             => 'يجب الموافقة على سياسة الخصوصية',
            'job_description.max'          => 'وصف الوظيفة طويل جداً (الحد الأقصى 5,000 حرف)',
        ];
    }

    public function tier(): string
    {
        return $this->input('tier', 'free');
    }
}

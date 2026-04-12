<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_id' => $this->job_id,
            'job' => $this->whenLoaded('job'),
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'cv_url' => $this->cv_path ? asset('storage/' . $this->cv_path) : null,
            'cover_letter' => $this->cover_letter,
            'linkedin_url' => $this->linkedin_url,
            'portfolio_url' => $this->portfolio_url,
            'status' => $this->status,
            'status_label' => $this->status_label,
            'notes' => $this->notes,
            'applied_at' => $this->applied_at?->diffForHumans(),
            'created_at' => $this->created_at,
        ];
    }
}

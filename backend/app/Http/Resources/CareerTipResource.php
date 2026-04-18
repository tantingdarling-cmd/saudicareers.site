<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CareerTipResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'title_en' => $this->title_en,
            'slug' => $this->slug,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'category' => $this->category,
            'category_label' => $this->getCategoryLabel(),
            'image' => $this->image,
            'author' => $this->author,
            'read_time' => $this->read_time,
            'is_featured' => $this->is_featured,
            'published_at' => $this->published_at?->diffForHumans(),
            'created_at' => $this->created_at,
        ];
    }
    
    private function getCategoryLabel(): string
    {
        return match($this->category) {
            'cv' => 'السيرة الذاتية',
            'interview' => 'المقابلة',
            'linkedin' => 'لينكد إن',
            'career' => 'مسار карьера',
            'salary' => 'الراتب',
            'skills'    => 'المهارات',
            'fresh_grad' => 'الخريجون',
            default     => 'أخرى',
        };
    }
}

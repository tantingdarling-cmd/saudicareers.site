<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class JobCollection extends ResourceCollection
{
    public $collects = JobResource::class;
    
    public function toArray(Request $request): array
    {
        $p = $this->resource;
        return [
            'data' => $this->collection,
            'meta' => [
                'current_page' => $p->currentPage(),
                'last_page'    => $p->lastPage(),
                'per_page'     => $p->perPage(),
                'total'        => $p->total(),
                'from'         => $p->firstItem(),
                'to'           => $p->lastItem(),
                'links'        => $p->linkCollection()->toArray(),
                'path'         => $p->path(),
            ],
            'links' => [
                'first' => $p->url(1),
                'last'  => $p->url($p->lastPage()),
                'prev'  => $p->previousPageUrl(),
                'next'  => $p->nextPageUrl(),
            ],
        ];
    }
}

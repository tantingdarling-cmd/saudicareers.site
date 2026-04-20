<?php echo '<?xml version="1.0" encoding="UTF-8"?>'; ?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

    {{-- Homepage --}}
    <url>
        <loc>https://saudicareers.site/</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
        <lastmod>{{ now()->toDateString() }}</lastmod>
    </url>

    {{-- §3: Active jobs — /jobs/{id} + lastmod from updated_at --}}
    @foreach ($jobs as $job)
    <url>
        <loc>https://saudicareers.site/jobs/{{ $job->id }}</loc>
        <lastmod>{{ $job->updated_at->toDateString() }}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>
    @endforeach

    {{-- §3: Published tips — /tips/{slug} + lastmod --}}
    @foreach ($tips as $tip)
    <url>
        <loc>https://saudicareers.site/tips/{{ $tip->slug }}</loc>
        <lastmod>{{ $tip->updated_at->toDateString() }}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.6</priority>
    </url>
    @endforeach

    {{-- Static tool & landing pages --}}
    @foreach ([
        ['tips',             '0.7', 'weekly'],
        ['resume-analyzer',  '0.8', 'weekly'],
        ['salary-insights',  '0.7', 'weekly'],
        ['resume/editor',    '0.6', 'monthly'],
    ] as [$path, $priority, $freq])
    <url>
        <loc>https://saudicareers.site/{{ $path }}</loc>
        <changefreq>{{ $freq }}</changefreq>
        <priority>{{ $priority }}</priority>
        <lastmod>{{ now()->toDateString() }}</lastmod>
    </url>
    @endforeach

</urlset>

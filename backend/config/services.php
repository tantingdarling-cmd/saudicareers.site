<?php

// config/services.php

return [

    'anthropic' => [
        'key' => env('ANTHROPIC_API_KEY'),
    ],

    'telegram' => [
        'bot_token' => env('TELEGRAM_BOT_TOKEN'),
        'chat_id'   => env('TELEGRAM_CHAT_ID'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

];

<?php

namespace App\Enums;

enum UserRole: string
{
    case Owner = 'owner';
    case User = 'user';

    public function isOwner(): bool
    {
        return $this === self::Owner;
    }
}

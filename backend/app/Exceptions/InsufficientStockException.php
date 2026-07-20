<?php

namespace App\Exceptions;

class InsufficientStockException extends DomainException
{
    public function __construct(
        string $message = 'Requested quantity exceeds available stock.',
        public readonly int $available = 0
    ) {
        parent::__construct(
            message: $message,
            status: 422,
            errorCode: 'INSUFFICIENT_STOCK',
            errors: ['stock' => [$message], 'available' => [$available]]
        );
    }
}

<?php

namespace App\Exceptions;

use Exception;

class DomainException extends Exception
{
    public function __construct(
        string $message,
        public readonly int $status = 422,
        public readonly ?string $errorCode = null,
        public readonly mixed $errors = null
    ) {
        parent::__construct($message, $status);
    }
}

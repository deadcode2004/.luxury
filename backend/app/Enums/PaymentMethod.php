<?php

namespace App\Enums;

enum PaymentMethod: string
{
    case Card = 'card';
    case Cod = 'cod';
    case Paypal = 'paypal';
}

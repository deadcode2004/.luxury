<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\Translation\ProductTranslationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class OwnerCustomerNameLocaleTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_customers_list_returns_bilingual_names(): void
    {
        $this->mock(ProductTranslationService::class, function ($mock) {
            $mock->shouldReceive('bilingualFromText')
                ->andReturnUsing(function (string $text, $previous = null) {
                    if ($previous && (trim((string) data_get($previous, 'ar', '')) === $text
                        || trim((string) data_get($previous, 'en', '')) === $text)) {
                        return [
                            'ar' => (string) data_get($previous, 'ar', $text),
                            'en' => (string) data_get($previous, 'en', $text),
                        ];
                    }

                    if (preg_match('/\p{Arabic}/u', $text)) {
                        return ['ar' => $text, 'en' => 'Translated '.$text];
                    }

                    return ['ar' => 'مترجم '.$text, 'en' => $text];
                });
        });

        $owner = User::factory()->create([
            'email' => 'owner@paradise.test',
            'role' => UserRole::Owner,
            'password' => Hash::make('password'),
        ]);

        User::factory()->create([
            'first_name' => 'سارة',
            'last_name' => 'محمد',
            'name' => 'سارة محمد',
            'email' => 'customer@paradise.test',
            'role' => UserRole::User,
            'password' => Hash::make('password'),
            'first_name_i18n' => null,
            'last_name_i18n' => null,
            'name_i18n' => null,
        ]);

        Sanctum::actingAs($owner);

        $response = $this->getJson('/api/v1/owner/customers');
        $response->assertOk();

        $customer = collect($response->json('data'))->firstWhere('email', 'customer@paradise.test');
        $this->assertNotNull($customer);
        $this->assertSame('سارة', data_get($customer, 'first_name_i18n.ar'));
        $this->assertSame('Translated سارة', data_get($customer, 'first_name_i18n.en'));
        $this->assertSame('سارة محمد', data_get($customer, 'name_i18n.ar'));
        $this->assertStringContainsString('Translated', (string) data_get($customer, 'name_i18n.en'));
    }
}

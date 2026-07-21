<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\User;
use App\Services\Translation\ProductTranslationService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountSettingsTest extends TestCase
{
    use RefreshDatabase;

    public function test_owner_can_update_profile_and_password(): void
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

                    // Arabic names → English; Latin names → Arabic stub.
                    if (preg_match('/\p{Arabic}/u', $text)) {
                        return ['ar' => $text, 'en' => 'Translated '.$text];
                    }

                    return ['ar' => 'مترجم '.$text, 'en' => $text];
                });
        });

        $owner = User::factory()->create([
            'first_name' => 'Old',
            'last_name' => 'Name',
            'email' => 'owner@paradise.test',
            'role' => UserRole::Owner,
            'password' => Hash::make('password'),
        ]);

        Sanctum::actingAs($owner);

        $this->putJson('/api/v1/account/profile', [
            'first_name' => 'أحمد',
            'last_name' => 'علي',
            'email' => 'owner@paradise.test',
            'phone' => '201000000001',
        ])->assertOk()
            ->assertJsonPath('data.first_name', 'أحمد')
            ->assertJsonPath('data.first_name_i18n.ar', 'أحمد')
            ->assertJsonPath('data.first_name_i18n.en', 'Translated أحمد')
            ->assertJsonPath('data.last_name_i18n.en', 'Translated علي')
            ->assertJsonPath('data.phone', '201000000001');

        $this->assertDatabaseHas('users', [
            'id' => $owner->id,
            'first_name' => 'أحمد',
            'last_name' => 'علي',
            'phone' => '201000000001',
        ]);

        $cms = $this->getJson('/api/v1/cms')->assertOk();
        $this->assertSame('owner@paradise.test', $cms->json('data.contact.email.value'));
        $this->assertTrue($cms->json('data.contact.email.enabled'));
        $this->assertContains('201000000001', $cms->json('data.contact.phones.numbers'));
        $this->assertTrue($cms->json('data.contact.phones.enabled'));

        $this->putJson('/api/v1/account/password', [
            'current_password' => 'password',
            'password' => 'new-password-123',
            'password_confirmation' => 'new-password-123',
        ])->assertOk();

        $owner->refresh();
        $this->assertTrue(Hash::check('new-password-123', $owner->password));

        $this->putJson('/api/v1/account/password', [
            'current_password' => 'wrong-password',
            'password' => 'another-password',
            'password_confirmation' => 'another-password',
        ])->assertStatus(422);

        $settings = $this->getJson('/api/v1/account/settings')->assertOk();
        $this->assertNotEmpty($settings->json('data.timezone'));
        $this->assertNotEmpty($settings->json('data.timezone_label'));
    }

    public function test_owner_can_update_notification_preferences(): void
    {
        $owner = User::factory()->create([
            'role' => UserRole::Owner,
            'notify_orders' => true,
            'notify_stock' => true,
            'notify_marketing' => false,
        ]);

        Sanctum::actingAs($owner);

        $this->putJson('/api/v1/account/notifications', [
            'notify_orders' => false,
            'notify_marketing' => true,
        ])->assertOk()
            ->assertJsonPath('data.notify_orders', false)
            ->assertJsonPath('data.notify_marketing', true);

        $this->assertDatabaseHas('users', [
            'id' => $owner->id,
            'notify_orders' => 0,
            'notify_marketing' => 1,
        ]);
    }
}

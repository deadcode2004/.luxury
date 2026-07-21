<?php

namespace Tests\Feature\Api;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AccountAvatarTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Build a tiny valid JPEG without requiring the GD extension.
     */
    private function fakeJpeg(string $name = 'avatar.jpg'): UploadedFile
    {
        $binary = base64_decode(
            '/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAgGBgcGBQgHBwcJCQgKDBQNDAsLDBkSEw8UHRofHh0aHBwgJC4nICIsIxwcKDcpLDAxNDQ0Hyc5PTgyPC4zNDL/2wBDAQkJCQwLDBgNDRgyIRwhMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjIyMjL/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAn/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIQAxAAAAGcP//Z'
        );

        return UploadedFile::fake()->createWithContent($name, $binary);
    }

    public function test_user_can_upload_replace_and_delete_own_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create([
            'role' => UserRole::User,
            'password' => Hash::make('password'),
            'avatar' => null,
        ]);

        Sanctum::actingAs($user);

        $upload = $this->post('/api/v1/account/avatar', [
            'avatar' => $this->fakeJpeg('me.jpg'),
        ], [
            'Accept' => 'application/json',
        ])->assertOk();

        $url = $upload->json('data.avatar');
        $this->assertNotEmpty($url);
        $this->assertStringStartsWith('/storage/uploads/avatars/'.$user->id.'/', $url);

        $relative = ltrim(str_replace('/storage/', '', $url), '/');
        Storage::disk('public')->assertExists($relative);

        $user->refresh();
        $this->assertSame($url, $user->avatar);

        $replace = $this->post('/api/v1/account/avatar', [
            'avatar' => $this->fakeJpeg('new.jpg'),
        ], [
            'Accept' => 'application/json',
        ])->assertOk();

        $newUrl = $replace->json('data.avatar');
        $this->assertNotSame($url, $newUrl);
        Storage::disk('public')->assertMissing($relative);

        $this->deleteJson('/api/v1/account/avatar')
            ->assertOk()
            ->assertJsonPath('data.avatar', null);

        $user->refresh();
        $this->assertNull($user->avatar);
    }

    public function test_guest_cannot_upload_avatar(): void
    {
        Storage::fake('public');

        $this->post('/api/v1/account/avatar', [
            'avatar' => $this->fakeJpeg(),
        ], [
            'Accept' => 'application/json',
        ])->assertUnauthorized();
    }

    public function test_rejects_non_image_avatar(): void
    {
        Storage::fake('public');

        $user = User::factory()->create(['role' => UserRole::Owner]);
        Sanctum::actingAs($user);

        $this->post('/api/v1/account/avatar', [
            'avatar' => UploadedFile::fake()->create('notes.pdf', 100, 'application/pdf'),
        ], [
            'Accept' => 'application/json',
        ])->assertStatus(422);
    }

    public function test_owner_avatar_update_is_scoped_to_self(): void
    {
        Storage::fake('public');

        $owner = User::factory()->create([
            'role' => UserRole::Owner,
            'avatar' => null,
        ]);
        $other = User::factory()->create([
            'role' => UserRole::User,
            'avatar' => '/storage/uploads/avatars/999/keep.jpg',
        ]);

        Sanctum::actingAs($owner);

        $this->post('/api/v1/account/avatar', [
            'avatar' => $this->fakeJpeg('owner.jpg'),
        ], [
            'Accept' => 'application/json',
        ])->assertOk();

        $other->refresh();
        $this->assertSame('/storage/uploads/avatars/999/keep.jpg', $other->avatar);
        $this->assertNotNull($owner->fresh()->avatar);
    }
}

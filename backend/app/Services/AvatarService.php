<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class AvatarService
{
    public const MAX_KILOBYTES = 5120;

    /** @var list<string> */
    public const ALLOWED_MIMES = [
        'image/jpeg',
        'image/png',
        'image/webp',
        'image/gif',
    ];

    /**
     * Store a new avatar for the authenticated user and remove any previous local file.
     */
    public function store(User $user, UploadedFile $file): User
    {
        $extension = strtolower($file->getClientOriginalExtension() ?: $file->extension() ?: 'jpg');
        if (! in_array($extension, ['jpg', 'jpeg', 'png', 'webp', 'gif'], true)) {
            $extension = 'jpg';
        }

        $name = Str::uuid()->toString().'.'.$extension;
        $path = $file->storeAs("uploads/avatars/{$user->id}", $name, 'public');
        $url = '/storage/'.$path;

        $this->deleteStoredFile($user->avatar);

        $user->forceFill(['avatar' => $url])->save();

        return $user->fresh() ?? $user;
    }

    /**
     * Clear the avatar and delete the local file when it belongs to this app.
     */
    public function clear(User $user): User
    {
        $this->deleteStoredFile($user->avatar);
        $user->forceFill(['avatar' => null])->save();

        return $user->fresh() ?? $user;
    }

    private function deleteStoredFile(?string $avatarUrl): void
    {
        if (! $avatarUrl) {
            return;
        }

        $path = $this->storagePathFromUrl($avatarUrl);
        if (! $path) {
            return;
        }

        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }

    /**
     * Only delete files under uploads/avatars/ (never external URLs).
     */
    private function storagePathFromUrl(string $avatarUrl): ?string
    {
        $path = parse_url($avatarUrl, PHP_URL_PATH) ?: $avatarUrl;
        $path = ltrim((string) $path, '/');

        if (str_starts_with($path, 'storage/')) {
            $path = substr($path, strlen('storage/'));
        }

        if (! str_starts_with($path, 'uploads/avatars/')) {
            return null;
        }

        return $path;
    }
}

<?php

use App\Models\Notification;

function notification_role_display(?string $role): ?string
{
    if ($role === null) {
        return null;
    }

    $normalized = strtolower(trim(str_replace(['-', '_'], ' ', $role)));
    $normalized = preg_replace('/\s+/', ' ', $normalized);

    return match ($normalized) {
        'admin', 'admin dashboard', 'admindashboard' => 'Admin',
        'ceo' => 'CEO',
        'project manager', 'projectmanager' => 'Project Manager',
        'simple user', 'simpleuser', 'user' => 'Simple User',
        default => $role,
    };
}

function notification_role_variants(?string $role): array
{
    $displayRole = notification_role_display($role);

    return match ($displayRole) {
        'Admin' => ['Admin', 'admin', 'Admin Dashboard', 'admindashboard'],
        'CEO' => ['CEO', 'ceo'],
        'Project Manager' => ['Project Manager', 'project_manager', 'project manager', 'projectmanager'],
        'Simple User' => ['Simple User', 'simple_user', 'simple user', 'simpleuser', 'user'],
        null => [],
        default => [$displayRole],
    };
}

function notify($title, $message, $roles = []): void
{
    foreach ($roles as $role) {
        $displayRole = notification_role_display($role);

        if (!$displayRole) {
            continue;
        }

        Notification::create([
            'title' => $title,
            'message' => $message,
            'role' => $displayRole,
        ]);
    }
}

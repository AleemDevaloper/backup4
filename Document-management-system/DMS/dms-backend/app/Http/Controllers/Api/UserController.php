<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class UserController extends Controller
{
    public function index()
    {
        return response()->json([
            'data' => User::query()
                ->latest('id')
                ->get()
                ->map(fn (User $u) => $this->userPayload($u))
                ->values(),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'empId' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string', 'min:6'],
            'role' => ['required', 'string', Rule::in(['Admin', 'Simple User', 'Project Manager', 'CEO'])],
        ]);
        notify(
             "New User Added",
             "Admin added a new user",
              ['project_manager']
              );

        notify(
    "User Added",
    "Manager added a new user",
    ['admin']
);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'emp_id' => $data['empId'] ?? null,
            'password' => $data['password'],
            'role' => $data['role'],
        ]);

        return response()->json(['data' => $this->userPayload($user)], 201);
    }

    public function show(User $user)
    {
        return response()->json(['data' => $this->userPayload($user)]);
    }

    public function update(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'empId' => ['nullable', 'string', 'max:255'],
            'password' => ['nullable', 'string', 'min:6'],
            'role' => ['sometimes', 'required', 'string', Rule::in(['Admin', 'Simple User', 'Project Manager', 'CEO'])],
        ]);

        $user->fill([
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
            'emp_id' => array_key_exists('empId', $data) ? ($data['empId'] ?? null) : $user->emp_id,
            'role' => $data['role'] ?? $user->role,
        ]);

        if (array_key_exists('password', $data) && $data['password']) {
            $user->password = $data['password'];
        }

        $user->save();

        return response()->json(['data' => $this->userPayload($user)]);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['ok' => true]);
    }

    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'empId' => $user->emp_id,
            'role' => $user->role,
        ];
    }
}

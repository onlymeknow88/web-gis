<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     */
    public function index(Request $request)
    {
        $query = User::query()->with('accessibleLayers');

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        if ($request->filled('role')) {
            $query->where('role', $request->input('role'));
        }

        if ($request->filled('status')) {
            $status = $request->input('status') === 'active' ? 1 : 0;
            $query->where('is_active', $status);
        }

        $limit = $request->input('limit', 10);
        if ($limit === 'all') {
            $limit = $query->count() ?: 10;
        } else {
            $limit = (int) $limit;
            if (!in_array($limit, [10, 20, 30, 50])) {
                $limit = 10;
            }
        }

        $users = $query->orderBy('id', 'desc')
            ->paginate($limit)
            ->withQueryString();

        return Inertia::render('Admin/Users/Users', [
            'users' => $users,
            'layers' => \App\Models\GisLayer::where('is_active', true)->orderBy('display_order', 'asc')->get(),
            'filters' => $request->only(['search', 'role', 'status', 'limit']),
        ]);
    }

    /**
     * Store a newly created user in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|regex:/^(?=.*[a-zA-Z])(?=.*\d).+$/', // minimum letters & numbers
            'role' => 'required|in:admin,user',
            'is_active' => 'required|boolean',
        ], [
            'password.regex' => 'Password harus mengandung kombinasi huruf dan angka.'
        ]);

        $validated['password'] = bcrypt($validated['password']);
        $user = User::create($validated);

        ActivityLog::log(
            action: 'CREATE',
            module: 'Manajemen Pengguna',
            description: "Membuat pengguna baru: {$user->name} ({$user->email}) dengan role {$user->role}",
            newValue: $user->makeHidden('password')->toArray()
        );

        return redirect()->back()->with('message', 'Pengguna berhasil ditambahkan.');
    }

    /**
     * Update the specified user in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($user->id),
            ],
            'role' => 'required|in:admin,user',
            'is_active' => 'required|boolean',
        ]);

        // Validation rule: Active admin cannot deactivate or change their own role.
        if ($user->id === auth()->id()) {
            if ($validated['is_active'] == false) {
                return redirect()->back()->withErrors([
                    'error' => 'Anda tidak dapat menonaktifkan akun Anda sendiri.'
                ]);
            }
            if ($validated['role'] !== 'admin') {
                return redirect()->back()->withErrors([
                    'error' => 'Anda tidak dapat mengubah role Anda sendiri dari admin.'
                ]);
            }
        }

        $oldValue = $user->makeHidden('password')->toArray();
        $user->update($validated);

        ActivityLog::log(
            action: 'UPDATE',
            module: 'Manajemen Pengguna',
            description: "Memperbarui data pengguna: {$user->name} ({$user->email})",
            oldValue: $oldValue,
            newValue: $user->makeHidden('password')->toArray()
        );

        return redirect()->back()->with('message', 'Pengguna berhasil diperbarui.');
    }

    /**
     * Remove the specified user from storage.
     */
    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors([
                'error' => 'Anda tidak dapat menghapus akun Anda sendiri.'
            ]);
        }

        // Integrity check: user must not have activity logs.
        $hasLogs = ActivityLog::where('user_id', $user->id)->exists();
        if ($hasLogs) {
            return redirect()->back()->withErrors([
                'error' => 'Pengguna tidak dapat dihapus karena memiliki riwayat log aktivitas. Silakan nonaktifkan akun ini.'
            ]);
        }

        $oldValue = $user->makeHidden('password')->toArray();
        $user->delete();

        ActivityLog::log(
            action: 'DELETE',
            module: 'Manajemen Pengguna',
            description: "Menghapus pengguna: {$oldValue['name']} ({$oldValue['email']})",
            oldValue: $oldValue
        );

        return redirect()->back()->with('message', 'Pengguna berhasil dihapus.');
    }

    /**
     * Reset user password to a temporary password.
     */
    public function resetPassword(User $user)
    {
        $tempPassword = 'WebGisTemp' . rand(100, 999) . '!';
        $user->password = bcrypt($tempPassword);
        $user->save();

        ActivityLog::log(
            action: 'RESET_PASSWORD',
            module: 'Manajemen Pengguna',
            description: "Mereset password untuk pengguna: {$user->name} ({$user->email})"
        );

        return redirect()->back()->with('temp_password_info', [
            'user_name' => $user->name,
            'temp_password' => $tempPassword
        ]);
    }

    /**
     * Update the user's GIS layer access permissions.
     */
    public function updateAccess(Request $request, User $user)
    {
        $validated = $request->validate([
            'layer_ids' => 'nullable|array',
            'layer_ids.*' => 'exists:gis_layers,id',
        ]);

        $user->accessibleLayers()->sync($validated['layer_ids'] ?? []);

        ActivityLog::log(
            action: 'UPDATE_ACCESS',
            module: 'Manajemen Pengguna',
            description: "Memperbarui hak akses layer untuk pengguna: {$user->name} ({$user->email})",
            newValue: ['layer_ids' => $validated['layer_ids'] ?? []]
        );

        return redirect()->back()->with('message', 'Akses layer pengguna berhasil diperbarui.');
    }
}


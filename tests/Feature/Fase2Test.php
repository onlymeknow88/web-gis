<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\GisLayer;
use App\Models\GisMarker;
use App\Models\ActivityLog;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class Fase2Test extends TestCase
{
    use RefreshDatabase;

    /**
     * Test that admin can access dashboard summary statistics.
     */
    public function test_admin_can_access_dashboard_summary(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $response = $this
            ->actingAs($admin)
            ->get('/dashboard');

        $response->assertOk();
    }

    /**
     * Test that admin can CRUD markers.
     */
    public function test_admin_can_crud_markers(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $layer = GisLayer::create([
            'display_name' => 'Boundary Layer',
            'geoserver_layer' => 'Indonesia:boundary',
            'geoserver_url' => 'https://geoserver.example.com/wms',
            'is_active' => true,
            'display_order' => 1,
            'created_by' => $admin->id,
        ]);

        // 1. Create Marker
        $response = $this
            ->actingAs($admin)
            ->post('/admin/markers', [
                'name' => 'New Mine Marker',
                'longitude' => 120.91234,
                'latitude' => -3.78912,
                'description' => 'Test description',
                'icon' => 'mine',
                'layer_id' => $layer->id,
                'is_active' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('gis_markers', [
            'name' => 'New Mine Marker',
            'longitude' => 120.91234,
            'latitude' => -3.78912,
        ]);

        $marker = GisMarker::where('name', 'New Mine Marker')->first();

        // 2. Update Marker
        $response = $this
            ->actingAs($admin)
            ->put("/admin/markers/{$marker->id}", [
                'name' => 'Updated Mine Marker',
                'longitude' => 120.95555,
                'latitude' => -3.75555,
                'description' => 'Updated description',
                'icon' => 'office',
                'layer_id' => $layer->id,
                'is_active' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('gis_markers', [
            'id' => $marker->id,
            'name' => 'Updated Mine Marker',
            'longitude' => 120.95555,
        ]);

        // 3. Delete Marker
        $response = $this
            ->actingAs($admin)
            ->delete("/admin/markers/{$marker->id}");

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('gis_markers', ['id' => $marker->id]);
    }

    /**
     * Test that admin can CRUD users.
     */
    public function test_admin_can_crud_users(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        // 1. Create User
        $response = $this
            ->actingAs($admin)
            ->post('/admin/users', [
                'name' => 'Staff Penambangan',
                'email' => 'staff@example.com',
                'password' => 'StaffPass123!',
                'role' => 'user',
                'is_active' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', [
            'name' => 'Staff Penambangan',
            'email' => 'staff@example.com',
            'role' => 'user',
        ]);

        $staff = User::where('email', 'staff@example.com')->first();

        // 2. Update User
        $response = $this
            ->actingAs($admin)
            ->put("/admin/users/{$staff->id}", [
                'name' => 'Staff Penambangan Update',
                'email' => 'staff_new@example.com',
                'role' => 'admin',
                'is_active' => true,
            ]);

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseHas('users', [
            'id' => $staff->id,
            'name' => 'Staff Penambangan Update',
            'email' => 'staff_new@example.com',
            'role' => 'admin',
        ]);

        // 3. Delete User
        $response = $this
            ->actingAs($admin)
            ->delete("/admin/users/{$staff->id}");

        $response->assertSessionHasNoErrors();
        $this->assertDatabaseMissing('users', ['id' => $staff->id]);
    }

    /**
     * Test admin self-modification validation constraints.
     */
    public function test_admin_cannot_self_delete_or_deactivate(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        // Cannot self-deactivate
        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->put("/admin/users/{$admin->id}", [
                'name' => $admin->name,
                'email' => $admin->email,
                'role' => 'admin',
                'is_active' => false,
            ]);

        $response->assertSessionHasErrors('error');
        $this->assertTrue($admin->fresh()->is_active);

        // Cannot self-delete
        $response = $this
            ->actingAs($admin)
            ->from('/admin/users')
            ->delete("/admin/users/{$admin->id}");

        $response->assertSessionHasErrors('error');
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }

    /**
     * Test admin password reset function.
     */
    public function test_admin_can_reset_user_password(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        $user = User::factory()->create([
            'role' => 'user',
            'is_active' => true,
        ]);

        $oldPassword = $user->password;

        $response = $this
            ->actingAs($admin)
            ->post("/admin/users/{$user->id}/reset-password");

        $response->assertSessionHasNoErrors();
        $response->assertSessionHas('temp_password_info');
        $this->assertNotEquals($oldPassword, $user->fresh()->password);
    }

    /**
     * Test admin can view and filter activity logs.
     */
    public function test_admin_can_view_activity_logs_with_filter(): void
    {
        $admin = User::factory()->create([
            'role' => 'admin',
            'is_active' => true,
        ]);

        ActivityLog::log(
            action: 'CREATE',
            module: 'Layer GIS',
            description: 'Test log for filter check'
        );

        $response = $this
            ->actingAs($admin)
            ->get('/admin/logs?module=Layer GIS');

        $response->assertOk();
    }
}

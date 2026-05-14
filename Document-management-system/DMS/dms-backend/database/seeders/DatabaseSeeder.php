<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;




class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => 'admin@asiancon.test'],
            [
                'name' => 'Admin',
                'emp_id' => 'ADMIN-1',
                'role' => 'Admin',
                'password' => 'password123',
            ],
        );

        // User::firstOrCreate(
        //     ['email' => 'pm@asiancon.test'],
        //     [
        //         'name' => 'Project Manager',
        //         'emp_id' => 'PM-1',
        //         'role' => 'Project Manager',
        //         'password' => 'password123',
        //     ],
        // );

        // User::firstOrCreate(
        //     ['email' => 'ceo@asiancon.test'],
        //     [
        //         'name' => 'CEO',
        //         'emp_id' => 'CEO-1',
        //         'role' => 'CEO',
        //         'password' => 'password123',
        //     ],
        // );

        // User::firstOrCreate(
        //     ['email' => 'user@asiancon.test'],
        //     [
        //         'name' => 'Simple User',
        //         'emp_id' => 'USER-1',
        //         'role' => 'Simple User',
        //         'password' => 'password123',
        //     ],
        // );
    }
}

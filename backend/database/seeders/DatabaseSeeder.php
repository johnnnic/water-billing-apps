<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        $this->call([
            UserSeeder::class,
            TariffSeeder::class, // Pindahkan ke atas
            CustomerSeeder::class,
            BillSeeder::class, // Pastikan ini setelah Customer dan Tariff
        ]);
    }
}

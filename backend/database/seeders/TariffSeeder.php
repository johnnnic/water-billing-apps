<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Tariff;

class TariffSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        Tariff::create([
            'golongan' => 'Sosial Umum',
            'daya_listrik' => '450 VA',
            'harga_per_m3' => 1500,
        ]);

        Tariff::create([
            'golongan' => 'Rumah Tangga A1',
            'daya_listrik' => '450 VA',
            'harga_per_m3' => 2500,
        ]);

        Tariff::create([
            'golongan' => 'Rumah Tangga A2',
            'daya_listrik' => '900 VA',
            'harga_per_m3' => 3500,
        ]);

        Tariff::create([
            'golongan' => 'Niaga Kecil',
            'daya_listrik' => '900 VA',
            'harga_per_m3' => 5000,
        ]);
    }
}

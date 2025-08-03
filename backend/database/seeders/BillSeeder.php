<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;
use App\Models\Bill;

class BillSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = Customer::all();

        foreach ($customers as $customer) {
            $tariff = \App\Models\Tariff::inRandomOrder()->first();
            if (!$tariff) {
                $this->command->info('Tariff not found for customer ' . $customer->id . ', skipping.');
                continue;
            }

            $meteran_awal = rand(100, 500);
            $meteran_akhir = $meteran_awal + rand(20, 100); // Pemakaian antara 20-100 m3
            $pemakaian = $meteran_akhir - $meteran_awal;
            $jumlah_tagihan = $pemakaian * $tariff->harga_per_m3;

            Bill::create([
                'customer_id' => $customer->id,
                'periode' => now()->subMonth()->format('Y-m'),
                'meteran_awal' => $meteran_awal,
                'meteran_akhir' => $meteran_akhir,
                'pemakaian' => $pemakaian,
                'tarif_per_m3' => $tariff->harga_per_m3,
                'jumlah_tagihan' => $jumlah_tagihan,
                'status' => 'belum_bayar',
                'tanggal_jatuh_tempo' => now()->day(20)->format('Y-m-d'),
            ]);
        }
    }
}

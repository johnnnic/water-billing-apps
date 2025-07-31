<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            ['nama' => 'Budi Santoso', 'alamat' => 'Jl. Merdeka No. 10, Jakarta'],
            ['nama' => 'Siti Aminah', 'alamat' => 'Jl. Pahlawan No. 25, Surabaya'],
            ['nama' => 'Ahmad Dahlan', 'alamat' => 'Jl. Gajah Mada No. 5, Bandung'],
            ['nama' => 'Dewi Lestari', 'alamat' => 'Jl. Sudirman No. 12, Medan'],
            ['nama' => 'Eko Prasetyo', 'alamat' => 'Jl. Diponegoro No. 88, Semarang'],
            ['nama' => 'Fitriani', 'alamat' => 'Jl. Kartini No. 21, Yogyakarta'],
            ['nama' => 'Gunawan', 'alamat' => 'Jl. Imam Bonjol No. 45, Makassar'],
            ['nama' => 'Herlina', 'alamat' => 'Jl. Teuku Umar No. 3, Denpasar'],
            ['nama' => 'Irfan Hakim', 'alamat' => 'Jl. Patimura No. 7, Palembang'],
            ['nama' => 'Joko Susilo', 'alamat' => 'Jl. Gatot Subroto No. 1, Bekasi'],
        ];

        foreach ($customers as $index => $customer) {
            Customer::create([
                'nomor_langganan' => 'PLG' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'nama' => $customer['nama'],
                'alamat' => $customer['alamat'],
                'status' => 'aktif',
            ]);
        }
    }
}

<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Customer;
use Carbon\Carbon;

class CustomerSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $customers = [
            [
                'nama' => 'Budi Santoso', 
                'alamat' => 'Jl. Merdeka No. 10, Jakarta Pusat', 
                'telepon' => '081234567890',
                'tarif_per_m3' => 5000,
                'meteran_terakhir' => 0
            ],
            [
                'nama' => 'Siti Aminah', 
                'alamat' => 'Jl. Pahlawan No. 25, Surabaya', 
                'telepon' => '085678901234',
                'tarif_per_m3' => 7500,
                'meteran_terakhir' => 100
            ],
            [
                'nama' => 'Ahmad Dahlan', 
                'alamat' => 'Jl. Gajah Mada No. 5, Bandung', 
                'telepon' => '087890123456',
                'tarif_per_m3' => 5000,
                'meteran_terakhir' => 50
            ],
            [
                'nama' => 'Dewi Lestari', 
                'alamat' => 'Jl. Sudirman No. 12, Medan', 
                'telepon' => '089012345678',
                'tarif_per_m3' => 6000,
                'meteran_terakhir' => 75
            ],
            [
                'nama' => 'Eko Prasetyo', 
                'alamat' => 'Jl. Diponegoro No. 88, Semarang', 
                'telepon' => '081345678901',
                'tarif_per_m3' => 5500,
                'meteran_terakhir' => 120
            ],
            [
                'nama' => 'Fitriani', 
                'alamat' => 'Jl. Kartini No. 21, Yogyakarta', 
                'telepon' => '085456789012',
                'tarif_per_m3' => 5000,
                'meteran_terakhir' => 80
            ],
            [
                'nama' => 'Gunawan', 
                'alamat' => 'Jl. Imam Bonjol No. 45, Makassar', 
                'telepon' => '087567890123',
                'tarif_per_m3' => 6500,
                'meteran_terakhir' => 95
            ],
            [
                'nama' => 'Herlina', 
                'alamat' => 'Jl. Teuku Umar No. 3, Denpasar', 
                'telepon' => '089678901234',
                'tarif_per_m3' => 7000,
                'meteran_terakhir' => 110
            ],
            [
                'nama' => 'Irfan Hakim', 
                'alamat' => 'Jl. Patimura No. 7, Palembang', 
                'telepon' => '081789012345',
                'tarif_per_m3' => 5500,
                'meteran_terakhir' => 60
            ],
            [
                'nama' => 'Joko Susilo', 
                'alamat' => 'Jl. Gatot Subroto No. 1, Bekasi', 
                'telepon' => '085890123456',
                'tarif_per_m3' => 5000,
                'meteran_terakhir' => 40
            ],
            [
                'nama' => 'Kartika Sari', 
                'alamat' => 'Jl. Ahmad Yani No. 15, Malang', 
                'telepon' => '087901234567',
                'tarif_per_m3' => 5500,
                'meteran_terakhir' => 85
            ],
            [
                'nama' => 'Lukman Hakim', 
                'alamat' => 'Jl. Veteran No. 33, Solo', 
                'telepon' => '089012345679',
                'tarif_per_m3' => 6000,
                'meteran_terakhir' => 130
            ],
            [
                'nama' => 'Maya Sinta', 
                'alamat' => 'Jl. Panglima Sudirman No. 77, Balikpapan', 
                'telepon' => '081123456780',
                'tarif_per_m3' => 7500,
                'meteran_terakhir' => 105
            ],
            [
                'nama' => 'Nurdin Halim', 
                'alamat' => 'Jl. Cut Nyak Dien No. 9, Banda Aceh', 
                'telepon' => '085234567891',
                'tarif_per_m3' => 6500,
                'meteran_terakhir' => 70
            ],
            [
                'nama' => 'Olivia Putri', 
                'alamat' => 'Jl. RA Kartini No. 18, Pontianak', 
                'telepon' => '087345678902',
                'tarif_per_m3' => 5500,
                'meteran_terakhir' => 90
            ]
        ];

        foreach ($customers as $index => $customer) {
            Customer::create([
                'nomor_langganan' => 'PLG' . str_pad($index + 1, 3, '0', STR_PAD_LEFT),
                'nama' => $customer['nama'],
                'alamat' => $customer['alamat'],
                'telepon' => $customer['telepon'],
                'status' => 'aktif',
                'tarif_per_m3' => $customer['tarif_per_m3'],
                'meteran_terakhir' => $customer['meteran_terakhir'],
                'tanggal_baca_terakhir' => Carbon::now()->subDays(rand(1, 30)),
            ]);
        }
    }
}

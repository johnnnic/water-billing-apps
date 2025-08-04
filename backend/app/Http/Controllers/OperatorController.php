<?php

namespace App\Http\Controllers;

use App\Models\Customer;
use App\Models\Bill;
use App\Models\Tariff;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class OperatorController extends Controller
{
    /**
     * Catat meteran pelanggan
     */
    public function catatMeteran(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomor_pelanggan' => 'required|string',
            'meteran_baru' => 'required|numeric|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Data tidak valid',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            // Find customer
            $customer = Customer::where('nomor_pelanggan', $request->nomor_pelanggan)->first();
            if (!$customer) {
                return response()->json([
                    'message' => 'Pelanggan tidak ditemukan'
                ], 404);
            }

            // Check if new meter reading is valid (should be >= current meter reading)
            if ($request->meteran_baru < $customer->meteran_terakhir) {
                return response()->json([
                    'message' => 'Meteran baru tidak boleh kurang dari meteran terakhir (' . $customer->meteran_terakhir . ' m³)'
                ], 422);
            }

            // Calculate usage
            $pemakaian = $request->meteran_baru - $customer->meteran_terakhir;
            
            // Get tariff
            $tariff = Tariff::where('is_active', true)->first();
            if (!$tariff) {
                return response()->json([
                    'message' => 'Tarif belum diatur'
                ], 422);
            }

            // Calculate amount
            $amount = $pemakaian * $tariff->harga_per_m3;

            // Update customer's last meter reading
            $customer->update([
                'meteran_terakhir' => $request->meteran_baru
            ]);

            // Create new bill
            $bill = Bill::create([
                'customer_id' => $customer->id,
                'bulan' => now()->format('Y-m'),
                'meteran_lama' => $customer->meteran_terakhir - $pemakaian,
                'meteran_baru' => $request->meteran_baru,
                'pemakaian' => $pemakaian,
                'tarif_per_m3' => $tariff->harga_per_m3,
                'jumlah_tagihan' => $amount,
                'status' => 'belum_bayar',
                'tanggal_tagihan' => now(),
                'jatuh_tempo' => now()->addDays(30),
            ]);

            return response()->json([
                'message' => 'Meteran berhasil dicatat',
                'data' => [
                    'customer' => $customer->name,
                    'nomor_pelanggan' => $customer->nomor_pelanggan,
                    'meteran_lama' => $customer->meteran_terakhir - $pemakaian,
                    'meteran_baru' => $request->meteran_baru,
                    'pemakaian' => $pemakaian,
                    'tarif_per_m3' => $tariff->harga_per_m3,
                    'jumlah_tagihan' => $amount,
                    'bill_id' => $bill->id
                ]
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Gagal mencatat meteran',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Get customer info for operator
     */
    public function getCustomerInfo(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nomor_pelanggan' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Nomor pelanggan harus diisi',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::where('nomor_pelanggan', $request->nomor_pelanggan)->first();
        
        if (!$customer) {
            return response()->json([
                'message' => 'Pelanggan tidak ditemukan'
            ], 404);
        }

        // Get latest bill
        $latestBill = Bill::where('customer_id', $customer->id)
            ->orderBy('created_at', 'desc')
            ->first();

        return response()->json([
            'customer' => $customer,
            'latest_bill' => $latestBill
        ]);
    }
}

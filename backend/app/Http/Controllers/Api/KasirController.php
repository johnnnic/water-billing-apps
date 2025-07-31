<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use App\Models\Bill;
use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;

class KasirController extends Controller
{
    /**
     * Cek tagihan pelanggan berdasarkan nomor pelanggan
     */
    public function cekTagihan(Request $request): JsonResponse
    {
        $request->validate([
            'nomor_pelanggan' => 'required|string'
        ]);

        try {
            // Cari customer berdasarkan nomor langganan
            $customer = Customer::where('nomor_langganan', $request->nomor_pelanggan)
                ->where('status', 'aktif')
                ->first();

            if (!$customer) {
                return response()->json([
                    'message' => 'Pelanggan tidak ditemukan atau tidak aktif'
                ], 404);
            }

            // Cari tagihan yang belum dibayar
            $tagihan = $customer->bills()
                ->where('status', 'belum_bayar')
                ->orderBy('periode', 'desc')
                ->first();

            if (!$tagihan) {
                return response()->json([
                    'message' => 'Tidak ada tagihan yang belum dibayar'
                ], 404);
            }

            return response()->json([
                'nama' => $customer->nama,
                'nomor_langganan' => $customer->nomor_langganan,
                'jumlah_tagihan' => $tagihan->jumlah_tagihan
            ]);

        } catch (\Exception $e) {
            // IMPORTANT: This is for debugging only. Remove detailed error in production.
            return response()->json([
                'message' => 'Terjadi kesalahan saat mengambil data tagihan',
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ], 500);
        }
    }

    /**
     * Proses pembayaran tagihan
     */
    public function bayar(Request $request): JsonResponse
    {
        $request->validate([
            'nomor_pelanggan' => 'required|string',
            'metode_pembayaran' => 'sometimes|in:tunai,transfer,kartu'
        ]);

        try {
            DB::beginTransaction();

            // Cari customer
            $customer = Customer::where('nomor_langganan', $request->nomor_pelanggan)
                ->where('status', 'aktif')
                ->first();

            if (!$customer) {
                return response()->json([
                    'message' => 'Pelanggan tidak ditemukan'
                ], 404);
            }

            // Cari tagihan yang belum dibayar
            $tagihan = $customer->bills()
                ->where('status', 'belum_bayar')
                ->orderBy('periode', 'desc')
                ->first();

            if (!$tagihan) {
                return response()->json([
                    'message' => 'Tidak ada tagihan yang belum dibayar'
                ], 404);
            }

            // Buat record pembayaran
            $payment = Payment::create([
                'bill_id' => $tagihan->id,
                'user_id' => Auth::id(), // ID kasir yang memproses
                'jumlah_bayar' => $tagihan->jumlah_tagihan,
                'metode_pembayaran' => $request->metode_pembayaran ?? 'tunai',
                'tanggal_bayar' => now(),
                'keterangan' => 'Pembayaran melalui kasir'
            ]);

            // Update status tagihan
            $tagihan->update([
                'status' => 'sudah_bayar'
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Pembayaran berhasil diproses',
                'payment_id' => $payment->id,
                'jumlah_bayar' => $payment->jumlah_bayar,
                'tanggal_bayar' => $payment->tanggal_bayar
            ]);

        } catch (\Exception $e) {
            DB::rollback();
            return response()->json([
                'message' => 'Terjadi kesalahan saat memproses pembayaran'
            ], 500);
        }
    }
}

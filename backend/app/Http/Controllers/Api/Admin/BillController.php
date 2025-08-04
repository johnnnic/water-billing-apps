<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bill;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class BillController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $bills = Bill::with(['customer' => function ($query) {
            $query->select('id', 'nomor_langganan', 'nama', 'alamat');
        }])
        ->latest()
        ->paginate(15);

        return response()->json($bills);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'periode' => 'required|string',
            'meteran_awal' => 'required|integer|min:0',
            'meteran_akhir' => 'required|integer|min:0',
            'tarif_per_m3' => 'required|numeric|min:0',
            'tanggal_jatuh_tempo' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();
        
        // Calculate pemakaian and jumlah_tagihan
        $data['pemakaian'] = $data['meteran_akhir'] - $data['meteran_awal'];
        $data['jumlah_tagihan'] = $data['pemakaian'] * $data['tarif_per_m3'];

        $bill = Bill::create($data);
        $bill->load('customer');

        return response()->json($bill, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Bill $bill): JsonResponse
    {
        $bill->load('customer', 'payments');
        return response()->json($bill);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Bill $bill): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customer_id' => 'required|exists:customers,id',
            'periode' => 'required|string',
            'meteran_awal' => 'required|integer|min:0',
            'meteran_akhir' => 'required|integer|min:0',
            'tarif_per_m3' => 'required|numeric|min:0',
            'tanggal_jatuh_tempo' => 'required|date',
            'status' => 'required|in:belum_bayar,sudah_bayar',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $data = $validator->validated();
        
        // Recalculate pemakaian and jumlah_tagihan
        $data['pemakaian'] = $data['meteran_akhir'] - $data['meteran_awal'];
        $data['jumlah_tagihan'] = $data['pemakaian'] * $data['tarif_per_m3'];

        $bill->update($data);
        $bill->load('customer');

        return response()->json($bill);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Bill $bill): JsonResponse
    {
        $bill->delete();
        return response()->json(['message' => 'Bill deleted successfully']);
    }

    /**
     * Generate bills for all customers for a specific period
     */
    public function generateBills(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'periode' => 'required|string',
            'tanggal_jatuh_tempo' => 'required|date',
        ]);

        if ($validator->fails()) {
            return response()->json($validator->errors(), 422);
        }

        $periode = $request->periode;
        $tanggalJatuhTempo = $request->tanggal_jatuh_tempo;

        // Get all active customers
        $customers = Customer::where('status', 'aktif')->get();
        $billsCreated = 0;

        foreach ($customers as $customer) {
            // Check if bill already exists for this period
            $existingBill = Bill::where('customer_id', $customer->id)
                ->where('periode', $periode)
                ->first();

            if (!$existingBill) {
                // Create new bill (you might want to get actual meter readings)
                Bill::create([
                    'customer_id' => $customer->id,
                    'periode' => $periode,
                    'meteran_awal' => $customer->meteran_terakhir,
                    'meteran_akhir' => $customer->meteran_terakhir, // Same as awal for now
                    'pemakaian' => 0, // Will be updated when meter reading is done
                    'tarif_per_m3' => $customer->tarif_per_m3,
                    'jumlah_tagihan' => 0, // Will be calculated after meter reading
                    'tanggal_jatuh_tempo' => $tanggalJatuhTempo,
                ]);
                $billsCreated++;
            }
        }

        return response()->json([
            'message' => "Successfully generated {$billsCreated} bills for period {$periode}",
            'bills_created' => $billsCreated
        ]);
    }

    /**
     * Import bills from Excel data
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'bills' => 'required|array|min:1',
            'bills.*.nomor_pelanggan' => 'required|string|exists:customers,nomor_langganan',
            'bills.*.periode' => 'required|string|regex:/^\d{4}-\d{2}$/',
            'bills.*.meteran_awal' => 'required|integer|min:0',
            'bills.*.meteran_akhir' => 'required|integer|min:0',
            'bills.*.tanggal_jatuh_tempo' => 'required|date',
        ], [
            'bills.required' => 'Data bills tidak boleh kosong',
            'bills.array' => 'Format data bills harus berupa array',
            'bills.min' => 'Minimal harus ada 1 data untuk diimpor',
            'bills.*.nomor_pelanggan.required' => 'Nomor pelanggan wajib diisi',
            'bills.*.nomor_pelanggan.exists' => 'Nomor pelanggan tidak ditemukan di database',
            'bills.*.periode.required' => 'Periode wajib diisi',
            'bills.*.periode.regex' => 'Format periode harus YYYY-MM (contoh: 2024-01)',
            'bills.*.meteran_awal.required' => 'Meteran awal wajib diisi',
            'bills.*.meteran_awal.integer' => 'Meteran awal harus berupa angka',
            'bills.*.meteran_awal.min' => 'Meteran awal tidak boleh negatif',
            'bills.*.meteran_akhir.required' => 'Meteran akhir wajib diisi',
            'bills.*.meteran_akhir.integer' => 'Meteran akhir harus berupa angka',
            'bills.*.meteran_akhir.min' => 'Meteran akhir tidak boleh negatif',
            'bills.*.tanggal_jatuh_tempo.required' => 'Tanggal jatuh tempo wajib diisi',
            'bills.*.tanggal_jatuh_tempo.date' => 'Format tanggal jatuh tempo tidak valid (gunakan YYYY-MM-DD)',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
                'error_count' => $validator->errors()->count()
            ], 422);
        }

        try {
            $importedCount = 0;
            $bills = collect($request->bills)->map(function ($billData, $index) use (&$importedCount) {
                // Additional validation for meteran
                if ($billData['meteran_akhir'] <= $billData['meteran_awal']) {
                    throw new \Exception("Row " . ($index + 2) . ": Meteran akhir ({$billData['meteran_akhir']}) harus lebih besar dari meteran awal ({$billData['meteran_awal']}) untuk pelanggan {$billData['nomor_pelanggan']}");
                }

                // Find customer by nomor_langganan
                $customer = Customer::where('nomor_langganan', $billData['nomor_pelanggan'])->first();
                
                if (!$customer) {
                    throw new \Exception("Row " . ($index + 2) . ": Customer with number {$billData['nomor_pelanggan']} not found");
                }

                // Check if bill already exists for this customer and period
                $existingBill = Bill::where('customer_id', $customer->id)
                    ->where('periode', $billData['periode'])
                    ->first();

                if ($existingBill) {
                    throw new \Exception("Row " . ($index + 2) . ": Bill already exists for customer {$billData['nomor_pelanggan']} in period {$billData['periode']}");
                }

                // Calculate pemakaian and jumlah_tagihan
                $pemakaian = $billData['meteran_akhir'] - $billData['meteran_awal'];
                $jumlah_tagihan = $pemakaian * $customer->tarif_per_m3;

                return [
                    'customer_id' => $customer->id,
                    'periode' => $billData['periode'],
                    'meteran_awal' => $billData['meteran_awal'],
                    'meteran_akhir' => $billData['meteran_akhir'],
                    'pemakaian' => $pemakaian,
                    'tarif_per_m3' => $customer->tarif_per_m3,
                    'jumlah_tagihan' => $jumlah_tagihan,
                    'status' => 'belum_bayar',
                    'tanggal_jatuh_tempo' => $billData['tanggal_jatuh_tempo'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ];
            });

            // Insert all bills
            Bill::insert($bills->toArray());

            return response()->json([
                'message' => 'Bills imported successfully',
                'imported_count' => $bills->count()
            ], 201);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Import failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    /**
     * Download template for bill import
     */
    public function downloadTemplate(): JsonResponse
    {
        try {
            // Get some sample customers for the template
            $customers = Customer::select('nomor_langganan', 'nama', 'meteran_terakhir')
                ->where('status', 'aktif')
                ->take(5)
                ->get();

            // If no customers found, create sample data
            if ($customers->isEmpty()) {
                $sampleData = [
                    [
                        'nomor_pelanggan' => 'Contoh: PLG001',
                        'periode' => '2025-08',
                        'meteran_awal' => 0,
                        'meteran_akhir' => 35,
                        'tanggal_jatuh_tempo' => '2025-09-03'
                    ]
                ];
            } else {
                // Use only first customer as example
                $customer = $customers->first();
                $sampleData = [
                    [
                        'nomor_pelanggan' => 'Contoh: ' . $customer->nomor_langganan,
                        'periode' => '2025-08',
                        'meteran_awal' => $customer->meteran_terakhir,
                        'meteran_akhir' => $customer->meteran_terakhir + 35,
                        'tanggal_jatuh_tempo' => '2025-09-03'
                    ]
                ];
            }

            $template = [
                'headers' => [
                    'nomor_pelanggan' => 'Nomor Pelanggan',
                    'periode' => 'Periode (YYYY-MM)',
                    'meteran_awal' => 'Meteran Awal',
                    'meteran_akhir' => 'Meteran Akhir',
                    'tanggal_jatuh_tempo' => 'Tanggal Jatuh Tempo (YYYY-MM-DD)'
                ],
                'sample_data' => $sampleData,
                'instructions' => [
                    '1. Hapus baris "Contoh:" sebelum mengimpor data',
                    '2. Pastikan nomor pelanggan sudah terdaftar di sistem',
                    '3. Format periode: YYYY-MM (contoh: 2025-08)',
                    '4. Meteran akhir harus lebih besar dari meteran awal',
                    '5. Format tanggal jatuh tempo: YYYY-MM-DD (contoh: 2025-09-03)',
                    '6. Jangan mengubah nama kolom (header)',
                    '7. Isi data mulai dari baris ke-3 (setelah header dan contoh)'
                ],
                'validation_rules' => [
                    'nomor_pelanggan' => 'Wajib diisi, harus sudah terdaftar',
                    'periode' => 'Format YYYY-MM, contoh: 2024-01',
                    'meteran_awal' => 'Angka positif',
                    'meteran_akhir' => 'Angka positif, harus > meteran_awal',
                    'tanggal_jatuh_tempo' => 'Format YYYY-MM-DD, contoh: 2024-02-15'
                ]
            ];

            return response()->json([
                'message' => 'Template generated successfully',
                'template' => $template
            ]);

        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Failed to generate template',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

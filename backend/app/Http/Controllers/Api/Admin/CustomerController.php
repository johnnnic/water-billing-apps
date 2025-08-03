<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Customer;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Validator;

class CustomerController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        // Ambil semua data customers tanpa pagination
        $customers = Customer::latest()->get();
        return response()->json([
            'data' => $customers,
            'total' => $customers->count()
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nomor_langganan' => 'required|string|unique:customers,nomor_langganan',
            'nama' => 'required|string|max:255',
            'alamat' => 'required|string',
            'telepon' => 'nullable|string',
            'status' => 'required|in:aktif,nonaktif',
            'tarif_per_m3' => 'required|numeric|min:0',
            'meteran_terakhir' => 'required|integer|min:0',
            'tanggal_baca_terakhir' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer = Customer::create($validator->validated());

        return response()->json($customer, 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Customer $customer): JsonResponse
    {
        return response()->json($customer);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Customer $customer): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'nomor_langganan' => 'sometimes|required|string|unique:customers,nomor_langganan,' . $customer->id,
            'nama' => 'sometimes|required|string|max:255',
            'alamat' => 'sometimes|required|string',
            'telepon' => 'nullable|string',
            'status' => 'sometimes|required|in:aktif,nonaktif',
            'tarif_per_m3' => 'sometimes|required|numeric|min:0',
            'meteran_terakhir' => 'sometimes|required|integer|min:0',
            'tanggal_baca_terakhir' => 'nullable|date',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        $customer->update($validator->validated());

        return response()->json($customer);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Customer $customer): JsonResponse
    {
        $customer->delete();
        return response()->json(null, 204);
    }

    /**
     * Import customers from array data
     */
    public function import(Request $request): JsonResponse
    {
        $validator = Validator::make($request->all(), [
            'customers' => 'required|array',
            'customers.*.nomor_langganan' => 'required|string|unique:customers,nomor_langganan',
            'customers.*.nama' => 'required|string|max:255',
            'customers.*.alamat' => 'required|string',
            'customers.*.telepon' => 'nullable|string',
            'customers.*.status' => 'required|in:aktif,nonaktif',
            'customers.*.tarif_per_m3' => 'required|numeric|min:0',
            'customers.*.meteran_terakhir' => 'required|integer|min:0',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => 'Validation failed',
                'errors' => $validator->errors()
            ], 422);
        }

        try {
            $customers = collect($request->customers)->map(function ($customerData) {
                $customerData['tanggal_baca_terakhir'] = now();
                return Customer::create($customerData);
            });

            return response()->json([
                'message' => 'Import berhasil',
                'imported_count' => $customers->count(),
                'customers' => $customers
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Terjadi kesalahan saat import data',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}

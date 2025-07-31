<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KasirController;

// Rute yang dapat diakses publik
Route::post('/login', [AuthController::class, 'login']);

// Rute yang dilindungi oleh otentikasi Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::prefix('kasir')->group(function () {
        Route::post('/cek-tagihan', [KasirController::class, 'cekTagihan']);
        Route::post('/bayar', [KasirController::class, 'bayar']);
    });

    // Admin routes
    Route::prefix('admin')->group(function() {
        Route::apiResource('tariffs', App\Http\Controllers\Api\Admin\TariffController::class);
        Route::apiResource('customers', App\Http\Controllers\Api\Admin\CustomerController::class);
    });
});
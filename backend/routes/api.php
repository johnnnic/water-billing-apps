<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\KasirController;
use App\Http\Controllers\OperatorController;

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

    // Operator routes
    Route::prefix('operator')->group(function () {
        Route::post('/catat-meteran', [OperatorController::class, 'catatMeteran']);
        Route::post('/customer-info', [OperatorController::class, 'getCustomerInfo']);
    });

    // Admin routes
    Route::prefix('admin')->group(function() {
        Route::apiResource('tariffs', App\Http\Controllers\Api\Admin\TariffController::class);
        Route::apiResource('customers', App\Http\Controllers\Api\Admin\CustomerController::class);
        Route::post('customers/import', [App\Http\Controllers\Api\Admin\CustomerController::class, 'import']);
        
        // Bills routes - specific routes must come before resource routes
        Route::get('bills/template', [App\Http\Controllers\Api\Admin\BillController::class, 'downloadTemplate']);
        Route::post('bills/import', [App\Http\Controllers\Api\Admin\BillController::class, 'import']);
        Route::apiResource('bills', App\Http\Controllers\Api\Admin\BillController::class);
        
        Route::apiResource('payments', App\Http\Controllers\Api\Admin\PaymentController::class);
        
        // Dashboard routes
        Route::get('dashboard/stats', [App\Http\Controllers\Api\Admin\DashboardController::class, 'stats']);
        Route::get('dashboard/activities', [App\Http\Controllers\Api\Admin\DashboardController::class, 'recentActivities']);
        
        // Additional routes
        Route::post('bills/generate', [App\Http\Controllers\Api\Admin\BillController::class, 'generateBills']);
        Route::get('payments/stats', [App\Http\Controllers\Api\Admin\PaymentController::class, 'stats']);
        Route::get('payments/recent', [App\Http\Controllers\Api\Admin\PaymentController::class, 'recent']);
    });
});
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('customer_id')->constrained()->onDelete('cascade');
            $table->string('periode'); // Format: YYYY-MM (2024-01)
            $table->integer('meteran_awal');
            $table->integer('meteran_akhir');
            $table->integer('pemakaian'); // meteran_akhir - meteran_awal
            $table->decimal('tarif_per_m3', 10, 2);
            $table->decimal('jumlah_tagihan', 10, 2);
            $table->enum('status', ['belum_bayar', 'sudah_bayar'])->default('belum_bayar');
            $table->date('tanggal_jatuh_tempo');
            $table->timestamps();
            
            $table->unique(['customer_id', 'periode']); // Satu customer satu periode
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bills');
    }
};

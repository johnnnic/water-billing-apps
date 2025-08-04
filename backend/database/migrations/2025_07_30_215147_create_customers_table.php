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
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->string('nomor_langganan')->unique(); // PLG001, PLG002, etc
            $table->string('nama');
            $table->text('alamat');
            $table->string('telepon')->nullable();
            $table->enum('status', ['aktif', 'nonaktif'])->default('aktif');
            $table->decimal('tarif_per_m3', 10, 2)->default(5000); // Tarif per meter kubik
            $table->integer('meteran_terakhir')->default(0);
            $table->date('tanggal_baca_terakhir')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('customers');
    }
};

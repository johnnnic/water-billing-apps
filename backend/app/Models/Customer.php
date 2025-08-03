<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Customer extends Model
{
    protected $fillable = [
        'nomor_langganan',
        'nama',
        'alamat',
        'telepon',
        'status',
        'tarif_per_m3',
        'meteran_terakhir',
        'tanggal_baca_terakhir'
    ];

    protected $casts = [
        'tanggal_baca_terakhir' => 'date',
        'tarif_per_m3' => 'decimal:2'
    ];

    public function bills(): HasMany
    {
        return $this->hasMany(Bill::class);
    }

    public function getTagihanTerakhir()
    {
        return $this->bills()
            ->where('status', 'belum_bayar')
            ->orderBy('periode', 'desc')
            ->first();
    }
}

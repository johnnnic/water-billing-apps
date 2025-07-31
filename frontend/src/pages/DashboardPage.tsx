import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import api from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Users,
  Receipt,
  CreditCard,
  TrendingUp,
  Droplets,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react';

const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // 🔽 State untuk kasir
  const [nomorPelanggan, setNomorPelanggan] = useState('');
  const [dataTagihan, setDataTagihan] = useState<any | null>(null);
  const [loadingTagihan, setLoadingTagihan] = useState(false);

  const cekTagihan = async () => {
    setLoadingTagihan(true);
    try {
      const res = await api.post('/kasir/cek-tagihan', {
        nomor_pelanggan: nomorPelanggan,
      });
      setDataTagihan(res.data);
    } catch (err) {
      alert(err?.response?.data?.message || 'Tagihan tidak ditemukan.');
    } finally {
      setLoadingTagihan(false);
    }
  };

  const prosesBayar = async () => {
    try {
      await api.post('/kasir/bayar', {
        nomor_pelanggan: nomorPelanggan,
      });
      alert('Pembayaran berhasil!');
      setDataTagihan(null);
      setNomorPelanggan('');
    } catch (err) {
      alert('Pembayaran gagal!');
    }
  };

  const getRoleGreeting = () => {
    switch (user?.role) {
      case 'admin':
        return {
          title: 'Dashboard Administrator',
          description: 'Kelola semua aspek sistem tagihan air',
          stats: [
            { title: 'Total Pelanggan', value: '1,247', icon: Users, color: 'text-blue-400' },
            { title: 'Tagihan Bulan Ini', value: 'Rp 125.4M', icon: Receipt, color: 'text-green-400' },
            { title: 'Pembayaran Hari Ini', value: 'Rp 8.5M', icon: CreditCard, color: 'text-gold' },
            { title: 'Pertumbuhan', value: '+12.5%', icon: TrendingUp, color: 'text-emerald-400' },
          ]
        };
      case 'operator':
        return {
          title: 'Dashboard Operator',
          description: 'Kelola data pelanggan dan pencatatan meteran',
          stats: [
            { title: 'Pelanggan Baru', value: '23', icon: Users, color: 'text-blue-400' },
            { title: 'Meteran Dicatat', value: '156', icon: Droplets, color: 'text-blue-500' },
            { title: 'Pending Verifikasi', value: '12', icon: Clock, color: 'text-yellow-400' },
            { title: 'Selesai Hari Ini', value: '89', icon: CheckCircle, color: 'text-green-400' },
          ]
        };
      case 'kasir':
        return {
          title: 'Dashboard Kasir',
          description: 'Proses pembayaran dan cek tagihan pelanggan',
          stats: [
            { title: 'Pembayaran Hari Ini', value: '67', icon: CreditCard, color: 'text-gold' },
            { title: 'Total Transaksi', value: 'Rp 4.2M', icon: Receipt, color: 'text-green-400' },
            { title: 'Tagihan Tertunda', value: '34', icon: AlertCircle, color: 'text-red-400' },
            { title: 'Rata-rata Tagihan', value: 'Rp 62K', icon: TrendingUp, color: 'text-blue-400' },
          ]
        };
      default:
        return {
          title: 'Dashboard',
          description: 'Selamat datang di sistem tagihan air',
          stats: []
        };
    }
  };

  const { title, description, stats } = getRoleGreeting();

  const recentActivities = [
    {
      id: 1,
      action: 'Pembayaran diterima',
      customer: 'Ahmad Sulaiman',
      amount: 'Rp 85,000',
      time: '10 menit yang lalu',
      type: 'payment'
    },
    {
      id: 2,
      action: 'Pelanggan baru ditambahkan',
      customer: 'Siti Nurhaliza',
      amount: 'ID: 00127',
      time: '25 menit yang lalu',
      type: 'customer'
    },
    {
      id: 3,
      action: 'Tagihan diterbitkan',
      customer: 'Budi Santoso',
      amount: 'Rp 92,500',
      time: '1 jam yang lalu',
      type: 'bill'
    },
    {
      id: 4,
      action: 'Meteran dibaca',
      customer: 'Dewi Kartika',
      amount: '47 m³',
      time: '2 jam yang lalu',
      type: 'meter'
    },
  ];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'payment': return <CreditCard className="h-4 w-4 text-gold" />;
      case 'customer': return <Users className="h-4 w-4 text-blue-400" />;
      case 'bill': return <Receipt className="h-4 w-4 text-green-400" />;
      case 'meter': return <Droplets className="h-4 w-4 text-blue-500" />;
      default: return <AlertCircle className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">{title}</h1>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Selamat datang,</span>
          <span className="font-medium text-gold">{user?.name}</span>
          <span className="px-2 py-1 text-xs bg-gold text-black rounded-md font-medium capitalize">
            {user?.role}
          </span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-card/50 backdrop-blur-sm border-brown-medium shadow-soft hover:shadow-md transition-all">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-lg bg-brown-dark ${stat.color}`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Activities & Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Aktifitas */}
        <Card className="bg-card/50 backdrop-blur-sm border-brown-medium shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Aktivitas Terbaru</CardTitle>
            <CardDescription>Kegiatan sistem dalam 24 jam terakhir</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center gap-4 p-3 rounded-lg bg-brown-dark/50 border border-brown-medium">
                  <div className="flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gold">{activity.amount}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="bg-card/50 backdrop-blur-sm border-brown-medium shadow-soft">
          <CardHeader>
            <CardTitle className="text-foreground">Aksi Cepat</CardTitle>
            <CardDescription>Fitur yang sering digunakan</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              {user?.role === 'kasir' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm text-foreground">Nomor Pelanggan</label>
                    <input
                      value={nomorPelanggan}
                      onChange={(e) => setNomorPelanggan(e.target.value)}
                      className="w-full p-2 rounded-lg bg-input border border-brown-medium text-foreground"
                      placeholder="PLG001"
                    />
                  </div>

                  <div className="flex gap-4">
                    <button
                      onClick={cekTagihan}
                      className="p-4 w-full rounded-lg bg-gradient-gold text-black font-medium hover:shadow-gold transition-all transform hover:scale-105"
                      disabled={loadingTagihan}
                    >
                      🔍 Cek Tagihan
                    </button>
                    <button
                      onClick={prosesBayar}
                      className="p-4 w-full rounded-lg bg-brown-dark text-foreground border border-brown-medium hover:bg-brown-medium transition-all"
                      disabled={!dataTagihan}
                    >
                      💳 Proses Bayar
                    </button>
                  </div>

                  {dataTagihan && (
                    <div className="bg-card p-4 rounded-lg border border-brown-medium mt-2 text-sm text-foreground">
                      <p><strong>Nama:</strong> {dataTagihan.nama}</p>
                      <p><strong>Nomor:</strong> {dataTagihan.nomor_langganan}</p>
                      <p><strong>Tagihan:</strong> {formatRupiah(dataTagihan?.jumlah_tagihan || 0)}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

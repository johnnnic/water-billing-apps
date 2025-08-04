import React, { useState, useEffect } from 'react';
import { Save, Plus, Edit, Trash2, Settings as SettingsIcon } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface Tariff {
  id: number;
  golongan: string;
  kategori_pelanggan: string;
  harga_per_m3: number;
  created_at: string;
  updated_at: string;
}

interface TariffForm {
  golongan: string;
  kategori_pelanggan: string;
  harga_per_m3: number;
}

const formatRupiah = (angka: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(angka);
};

export const SettingsPage: React.FC = () => {
  const [tariffs, setTariffs] = useState<Tariff[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingTariff, setEditingTariff] = useState<Tariff | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const { toast } = useToast();

  const [tariffForm, setTariffForm] = useState<TariffForm>({
    golongan: '',
    kategori_pelanggan: '',
    harga_per_m3: 5000,
  });

  const fetchTariffs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/tariffs');
      setTariffs(response.data.data || response.data);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat data tarif",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTariff = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!tariffForm.golongan || !tariffForm.harga_per_m3) {
      toast({
        title: "Error",
        description: "Harap lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingTariff) {
        await api.put(`/admin/tariffs/${editingTariff.id}`, tariffForm);
        toast({
          title: "Berhasil",
          description: "Tarif berhasil diperbarui",
        });
      } else {
        await api.post('/admin/tariffs', tariffForm);
        toast({
          title: "Berhasil",
          description: "Tarif berhasil ditambahkan",
        });
      }
      
      setTariffForm({ golongan: '', kategori_pelanggan: '', harga_per_m3: 5000 });
      setEditingTariff(null);
      setShowAddForm(false);
      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menyimpan tarif",
        variant: "destructive",
      });
    }
  };

  const handleEditTariff = (tariff: Tariff) => {
    setTariffForm({
      golongan: tariff.golongan,
      kategori_pelanggan: tariff.kategori_pelanggan,
      harga_per_m3: tariff.harga_per_m3,
    });
    setEditingTariff(tariff);
    setShowAddForm(true);
  };

  const handleDeleteTariff = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus tarif ini?')) return;
    
    try {
      await api.delete(`/admin/tariffs/${id}`);
      toast({
        title: "Berhasil",
        description: "Tarif berhasil dihapus",
      });
      fetchTariffs();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal menghapus tarif",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setTariffForm({ golongan: '', kategori_pelanggan: '', harga_per_m3: 5000 });
    setEditingTariff(null);
    setShowAddForm(false);
  };

  useEffect(() => {
    fetchTariffs();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gold"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <SettingsIcon className="h-8 w-8 text-gold" />
        <div>
          <h1 className="text-3xl font-bold text-foreground">Pengaturan Sistem</h1>
          <p className="text-muted-foreground">Kelola konfigurasi dan pengaturan aplikasi</p>
        </div>
      </div>

      <Tabs defaultValue="tariffs" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tariffs">Tarif Air</TabsTrigger>
          <TabsTrigger value="system">Sistem</TabsTrigger>
          <TabsTrigger value="users">Pengguna</TabsTrigger>
        </TabsList>

        {/* Tariff Management */}
        <TabsContent value="tariffs" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-foreground">Manajemen Tarif Air</h2>
              <p className="text-muted-foreground">Atur tarif air berdasarkan golongan dan kategori pelanggan</p>
            </div>
            <Button 
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-gradient-gold text-black hover:shadow-gold"
            >
              <Plus className="h-4 w-4 mr-2" />
              Tambah Tarif
            </Button>
          </div>

          {/* Add/Edit Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>
                  {editingTariff ? 'Edit Tarif' : 'Tambah Tarif Baru'}
                </CardTitle>
                <CardDescription>
                  {editingTariff ? 'Perbarui data tarif air' : 'Tambahkan tarif air baru berdasarkan golongan dan kategori pelanggan'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmitTariff} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="golongan">
                        Golongan Tarif <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="golongan"
                        value={tariffForm.golongan}
                        onChange={(e) => setTariffForm(prev => ({ ...prev, golongan: e.target.value }))}
                        placeholder="A1, A2, B1, B2, dll"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="kategori_pelanggan">Kategori Pelanggan</Label>
                      <Input
                        id="kategori_pelanggan"
                        value={tariffForm.kategori_pelanggan}
                        onChange={(e) => setTariffForm(prev => ({ ...prev, kategori_pelanggan: e.target.value }))}
                        placeholder="Rumah Tangga, Komersial, Industri"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="harga_per_m3">
                        Harga per m³ (Rp) <span className="text-red-400">*</span>
                      </Label>
                      <Input
                        id="harga_per_m3"
                        type="number"
                        value={tariffForm.harga_per_m3}
                        onChange={(e) => setTariffForm(prev => ({ ...prev, harga_per_m3: parseInt(e.target.value) || 0 }))}
                        placeholder="5000"
                        min="0"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 pt-4">
                    <Button
                      type="submit"
                      className="bg-gradient-gold text-black hover:shadow-gold"
                    >
                      <Save className="h-4 w-4 mr-2" />
                      {editingTariff ? 'Perbarui' : 'Simpan'} Tarif
                    </Button>
                    
                    <Button type="button" variant="outline" onClick={resetForm}>
                      Batal
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          {/* Tariffs Table */}
          <Card>
            <CardHeader>
              <CardTitle>Daftar Tarif</CardTitle>
              <CardDescription>
                Total {tariffs.length} tarif tersedia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Golongan Tarif</TableHead>
                      <TableHead>Kategori Pelanggan</TableHead>
                      <TableHead>Harga per m³</TableHead>
                      <TableHead>Dibuat</TableHead>
                      <TableHead>Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tariffs.map((tariff) => (
                      <TableRow key={tariff.id}>
                        <TableCell className="font-medium">
                          {tariff.golongan}
                        </TableCell>
                        <TableCell>
                          {tariff.kategori_pelanggan || '-'}
                        </TableCell>
                        <TableCell className="font-medium text-gold">
                          {formatRupiah(tariff.harga_per_m3)}
                        </TableCell>
                        <TableCell>
                          {new Date(tariff.created_at).toLocaleDateString('id-ID')}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditTariff(tariff)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteTariff(tariff.id)}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              
              {tariffs.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Belum ada tarif yang ditambahkan</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Pengaturan Sistem</CardTitle>
              <CardDescription>Konfigurasi umum aplikasi</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Pengaturan sistem akan segera tersedia</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Management */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Manajemen Pengguna</CardTitle>
              <CardDescription>Kelola akun pengguna sistem</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-center py-8">
                <p className="text-muted-foreground">Manajemen pengguna akan segera tersedia</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

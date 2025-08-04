import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import api from '@/lib/api';

interface CustomerForm {
  nomor_langganan: string;
  nama: string;
  alamat: string;
  telepon: string;
  status: 'aktif' | 'nonaktif';
  tarif_per_m3: number;
  meteran_terakhir: number;
}

interface Customer extends CustomerForm {
  id: number;
  tanggal_baca_terakhir: string;
  created_at: string;
  updated_at: string;
}

export const EditCustomerPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const [loading, setLoading] = useState(false);
  const [loadingCustomer, setLoadingCustomer] = useState(true);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [formData, setFormData] = useState<CustomerForm>({
    nomor_langganan: '',
    nama: '',
    alamat: '',
    telepon: '',
    status: 'aktif',
    tarif_per_m3: 5000,
    meteran_terakhir: 0,
  });

  const handleInputChange = (field: keyof CustomerForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const fetchCustomer = async () => {
    if (!id) return;
    
    try {
      setLoadingCustomer(true);
      const response = await api.get(`/admin/customers/${id}`);
      const customerData = response.data;
      
      setCustomer(customerData);
      setFormData({
        nomor_langganan: customerData.nomor_langganan,
        nama: customerData.nama,
        alamat: customerData.alamat,
        telepon: customerData.telepon || '',
        status: customerData.status,
        tarif_per_m3: customerData.tarif_per_m3,
        meteran_terakhir: customerData.meteran_terakhir,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Gagal memuat data pelanggan",
        variant: "destructive",
      });
      navigate('/customers');
    } finally {
      setLoadingCustomer(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.nomor_langganan || !formData.nama || !formData.alamat) {
      toast({
        title: "Error",
        description: "Harap lengkapi semua field yang wajib diisi",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);
      console.log('Data yang akan diupdate:', formData); // Debug log
      
      await api.put(`/admin/customers/${id}`, formData);
      
      toast({
        title: "Berhasil",
        description: "Data pelanggan berhasil diperbarui",
      });
      
      navigate('/customers');
    } catch (error: any) {
      console.error('Error details:', error.response?.data); // Debug log
      
      let errorMessage = "Gagal memperbarui data pelanggan";
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errors = error.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        errorMessage = errorMessages.join(', ');
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  if (loadingCustomer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Memuat data pelanggan...</span>
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground mb-2">Pelanggan tidak ditemukan</h2>
          <Button onClick={() => navigate('/customers')}>
            Kembali ke Daftar Pelanggan
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate('/customers')}
          className="p-2"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground">Edit Pelanggan</h1>
          <p className="text-muted-foreground">Perbarui data pelanggan {customer.nama}</p>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Informasi Pelanggan</CardTitle>
            <CardDescription>
              Perbarui data pelanggan dengan informasi yang benar
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Nomor Pelanggan */}
              <div className="space-y-2">
                <Label htmlFor="nomor_langganan">
                  Nomor Pelanggan <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="nomor_langganan"
                  value={formData.nomor_langganan}
                  onChange={(e) => handleInputChange('nomor_langganan', e.target.value)}
                  placeholder="PLG001"
                  required
                />
              </div>

              {/* Nama */}
              <div className="space-y-2">
                <Label htmlFor="nama">
                  Nama Lengkap <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="nama"
                  value={formData.nama}
                  onChange={(e) => handleInputChange('nama', e.target.value)}
                  placeholder="Masukkan nama lengkap"
                  required
                />
              </div>

              {/* Alamat */}
              <div className="space-y-2">
                <Label htmlFor="alamat">
                  Alamat <span className="text-red-400">*</span>
                </Label>
                <Textarea
                  id="alamat"
                  value={formData.alamat}
                  onChange={(e) => handleInputChange('alamat', e.target.value)}
                  placeholder="Masukkan alamat lengkap"
                  rows={3}
                  required
                />
              </div>

              {/* Telepon */}
              <div className="space-y-2">
                <Label htmlFor="telepon">Nomor Telepon</Label>
                <Input
                  id="telepon"
                  type="tel"
                  value={formData.telepon}
                  onChange={(e) => handleInputChange('telepon', e.target.value)}
                  placeholder="08xxxxxxxxxx"
                />
              </div>

              {/* Status */}
              <div className="space-y-2">
                <Label>Status Pelanggan</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleInputChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="aktif">Aktif</SelectItem>
                    <SelectItem value="nonaktif">Non-aktif</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Tarif per m3 */}
              <div className="space-y-2">
                <Label htmlFor="tarif_per_m3">Tarif per m³ (Rp)</Label>
                <Input
                  id="tarif_per_m3"
                  type="number"
                  value={formData.tarif_per_m3}
                  onChange={(e) => handleInputChange('tarif_per_m3', parseInt(e.target.value) || 0)}
                  placeholder="5000"
                  min="0"
                />
              </div>

              {/* Meteran Terakhir */}
              <div className="space-y-2">
                <Label htmlFor="meteran_terakhir">Meteran Terakhir (m³)</Label>
                <Input
                  id="meteran_terakhir"
                  type="number"
                  value={formData.meteran_terakhir}
                  onChange={(e) => handleInputChange('meteran_terakhir', parseInt(e.target.value) || 0)}
                  placeholder="0"
                  min="0"
                />
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center gap-4 pt-4">
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-gradient-gold text-black hover:shadow-gold"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  Simpan Perubahan
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/customers')}
                  disabled={loading}
                >
                  Batal
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

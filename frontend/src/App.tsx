import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/layout/AppLayout";
import { LoginPage } from "@/pages/LoginPage";
import { DashboardPage } from "@/pages/DashboardPage";
import NotFound from "./pages/NotFound";

// Admin Pages
import { CustomersPage } from "@/pages/admin/CustomersPage";
import { BillsPage } from "@/pages/admin/BillsPage";
import { TransactionsPage } from "@/pages/admin/TransactionsPage";
import { SettingsPage } from "@/pages/admin/SettingsPage";

// Kasir Pages
import { CheckBillPage } from "@/pages/kasir/CheckBillPage";
import { PaymentPage } from "@/pages/kasir/PaymentPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/unauthorized" element={<div className="min-h-screen flex items-center justify-center bg-background"><h1 className="text-2xl text-foreground">Akses Ditolak</h1></div>} />
            
            <Route path="/" element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }>
              <Route path="dashboard" element={<DashboardPage />} />
              
              {/* Admin Routes */}
              <Route path="customers" element={
                <ProtectedRoute allowedRoles={['admin', 'operator']}>
                  <CustomersPage />
                </ProtectedRoute>
              } />
              <Route path="bills" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <BillsPage />
                </ProtectedRoute>
              } />
              <Route path="transactions" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <TransactionsPage />
                </ProtectedRoute>
              } />
              <Route path="settings" element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <SettingsPage />
                </ProtectedRoute>
              } />
              
              {/* Kasir Routes */}
              <Route path="bills/check" element={
                <ProtectedRoute allowedRoles={['kasir']}>
                  <CheckBillPage />
                </ProtectedRoute>
              } />
              <Route path="payments" element={
                <ProtectedRoute allowedRoles={['kasir']}>
                  <PaymentPage />
                </ProtectedRoute>
              } />
            </Route>
            
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;

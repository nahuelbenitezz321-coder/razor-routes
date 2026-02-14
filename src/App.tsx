import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/AppLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Servicios from "./pages/Servicios";
import Clientes from "./pages/Clientes";
import Caja from "./pages/Caja";
import Estadisticas from "./pages/Estadisticas";
import Configuracion from "./pages/Configuracion";
import Barberos from "./pages/Barberos";
import CodigosInvitacion from "./pages/CodigosInvitacion";
import DatosBarberia from "./pages/DatosBarberia";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/login" element={<Login />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/servicios" element={<Servicios />} />
              <Route path="/clientes" element={<Clientes />} />
              <Route path="/caja" element={<Caja />} />
              <Route path="/estadisticas" element={<Estadisticas />} />
              <Route path="/configuracion" element={<Configuracion />} />
              <Route path="/barberos" element={<Barberos />} />
              <Route path="/codigos-invitacion" element={<CodigosInvitacion />} />
              <Route path="/datos-barberia" element={<DatosBarberia />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

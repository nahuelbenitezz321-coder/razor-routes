import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  Scissors,
  DollarSign,
  Users,
  TrendingUp,
  Plus,
  Banknote,
  CreditCard,
  Lock,
  CheckCircle2,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NuevoTrabajoDialog from "@/components/NuevoTrabajoDialog";

const Dashboard = () => {
  const { barberiaId, role } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const { data: trabajosHoy = [] } = useQuery({
    queryKey: ["trabajos-hoy", barberiaId, today],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("trabajos")
        .select("*, barberos(nombre), servicios(nombre)")
        .eq("barberia_id", barberiaId)
        .eq("fecha", today)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  const { data: gastosHoy = [] } = useQuery({
    queryKey: ["gastos-hoy", barberiaId, today],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .eq("barberia_id", barberiaId)
        .eq("fecha", today);
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  const { data: cierreHoy } = useQuery({
    queryKey: ["cierre-hoy", barberiaId, today],
    queryFn: async () => {
      if (!barberiaId) return null;
      const { data, error } = await supabase
        .from("cierres_caja")
        .select("id")
        .eq("barberia_id", barberiaId)
        .eq("fecha", today)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId && role === "owner",
  });

  const { data: barberia } = useQuery({
    queryKey: ["barberia-nombre", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return null;
      const { data, error } = await supabase
        .from("barberias")
        .select("nombre, logo_url")
        .eq("id", barberiaId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  const ingresosHoy = trabajosHoy.reduce((sum, t) => sum + Number(t.precio), 0);
  const comisionesHoy = trabajosHoy.reduce((sum, t) => sum + Number(t.comision), 0);
  const totalGastos = gastosHoy.reduce((sum, g) => sum + Number(g.monto), 0);
  const clientesUnicos = new Set(trabajosHoy.filter((t) => t.cliente_id).map((t) => t.cliente_id)).size;
  const gananciaHoy = ingresosHoy - comisionesHoy - totalGastos;

  const efectivo = trabajosHoy.filter((t) => t.metodo_pago === "efectivo").reduce((s, t) => s + Number(t.precio), 0);
  const mercadoPago = trabajosHoy.filter((t) => t.metodo_pago === "mercado_pago").reduce((s, t) => s + Number(t.precio), 0);

  const cajaCerrada = !!cierreHoy;

  const stats = [
    { label: "Trabajos", value: String(trabajosHoy.length), icon: Scissors, color: "text-primary" },
    { label: "Ingresos", value: `$${ingresosHoy}`, icon: DollarSign, color: "text-primary" },
    { label: "Clientes", value: String(clientesUnicos), icon: Users, color: "text-primary" },
    { label: "Comisiones", value: `$${comisionesHoy}`, icon: TrendingUp, color: "text-destructive" },
  ];

  const nombreBarberia = barberia?.nombre || "BARBERÍA";
  const logoUrl = barberia?.logo_url || "/logo-jr.jpg";

  return (
    <div className="px-4 pt-6 pb-24">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={logoUrl} alt={nombreBarberia} className="h-12 w-12 rounded-full object-cover ring-2 ring-primary" />
          <div>
            <h1 className="text-2xl text-primary">{nombreBarberia.toUpperCase()}</h1>
            <p className="text-sm text-muted-foreground capitalize">
              {format(new Date(), "EEEE d 'de' MMMM", { locale: es })}
            </p>
          </div>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Trabajo
        </Button>
      </div>

      {/* Caja status badge */}
      {role === "owner" && (
        <div className="mb-4">
          {cajaCerrada ? (
            <div className="flex items-center gap-2 rounded-lg bg-primary/10 p-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">Caja cerrada hoy</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 rounded-lg bg-secondary p-3">
              <Lock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Caja abierta — cerrá desde la sección Caja</span>
            </div>
          )}
        </div>
      )}

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="flex flex-col items-start gap-2 p-4">
              <s.icon className={cn("h-5 w-5", s.color)} />
              <p className="text-2xl font-bold font-sans">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ganancia neta + gastos */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Gastos</p>
            <p className="text-xl font-bold text-destructive">${totalGastos}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-1">Ganancia neta</p>
            <p className={cn("text-xl font-bold", gananciaHoy >= 0 ? "text-primary" : "text-destructive")}>
              ${gananciaHoy}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment method split */}
      {trabajosHoy.length > 0 && (
        <Card className="border-border bg-card mb-4">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">Método de pago</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <Banknote className="h-4 w-4 text-primary" /> Efectivo
                </span>
                <span className="font-medium">${efectivo}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-2 text-sm">
                  <CreditCard className="h-4 w-4 text-primary" /> Mercado Pago
                </span>
                <span className="font-medium">${mercadoPago}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Últimos trabajos */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <h2 className="mb-3 text-lg text-primary">ÚLTIMOS TRABAJOS</h2>
          {trabajosHoy.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay trabajos registrados hoy</p>
          ) : (
            <div className="space-y-2">
              {trabajosHoy.slice(0, 10).map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg bg-secondary p-3 text-sm">
                  <div>
                    <p className="font-medium">{(t as any).barberos?.nombre || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {(t as any).servicios?.nombre || "—"} · {t.metodo_pago === "mercado_pago" ? "MP" : "Efectivo"}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${t.precio}</p>
                    <p className="text-xs text-muted-foreground">Com: ${t.comision}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <NuevoTrabajoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Dashboard;

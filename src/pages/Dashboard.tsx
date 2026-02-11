import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Scissors, DollarSign, Users, TrendingUp, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NuevoTrabajoDialog from "@/components/NuevoTrabajoDialog";

const Dashboard = () => {
  const { barberiaId } = useAuth();
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

  const ingresosHoy = trabajosHoy.reduce((sum, t) => sum + Number(t.precio), 0);
  const comisionesHoy = trabajosHoy.reduce((sum, t) => sum + Number(t.comision), 0);
  const clientesUnicos = new Set(trabajosHoy.filter((t) => t.cliente_id).map((t) => t.cliente_id)).size;
  const gananciaHoy = ingresosHoy - comisionesHoy;

  const stats = [
    { label: "Trabajos hoy", value: String(trabajosHoy.length), icon: Scissors, color: "text-primary" },
    { label: "Ingresos hoy", value: `$${ingresosHoy}`, icon: DollarSign, color: "text-emerald-400" },
    { label: "Clientes", value: String(clientesUnicos), icon: Users, color: "text-sky-400" },
    { label: "Comisiones", value: `$${comisionesHoy}`, icon: TrendingUp, color: "text-amber-400" },
  ];

  return (
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo-jr.jpg" alt="JR Barbería" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary" />
          <div>
            <h1 className="text-2xl text-primary">JR BARBERÍA</h1>
            <p className="text-sm text-muted-foreground">Resumen del día</p>
          </div>
        </div>
        <Button size="sm" className="gap-1" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Trabajo
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {stats.map((s) => (
          <Card key={s.label} className="border-border bg-card">
            <CardContent className="flex flex-col items-start gap-2 p-4">
              <s.icon className={`h-5 w-5 ${s.color}`} />
              <p className="text-2xl font-bold font-sans">{s.value}</p>
              <p className="text-xs text-muted-foreground">{s.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ganancia neta */}
      <Card className="mt-3 border-border bg-card">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Ganancia neta hoy</p>
          <p className="text-3xl font-bold text-primary">${gananciaHoy}</p>
        </CardContent>
      </Card>

      {/* Últimos trabajos */}
      <Card className="mt-4 border-border bg-card">
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

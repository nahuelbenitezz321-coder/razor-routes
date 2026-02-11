import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowUpCircle, ArrowDownCircle, Plus } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import NuevoTrabajoDialog from "@/components/NuevoTrabajoDialog";

const Caja = () => {
  const { barberiaId } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  const { data: trabajosHoy = [] } = useQuery({
    queryKey: ["trabajos-hoy", barberiaId, today],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("trabajos")
        .select("*")
        .eq("barberia_id", barberiaId)
        .eq("fecha", today);
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

  const ingresos = trabajosHoy.reduce((sum, t) => sum + Number(t.precio), 0);
  const comisiones = trabajosHoy.reduce((sum, t) => sum + Number(t.comision), 0);
  const gastos = gastosHoy.reduce((sum, g) => sum + Number(g.monto), 0);
  const ganancia = ingresos - comisiones - gastos;

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-4 text-2xl text-primary">CAJA DEL DÍA</h1>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowUpCircle className="h-4 w-4 text-primary" />
              <span className="text-xs text-muted-foreground">Ingresos</span>
            </div>
            <p className="text-xl font-bold">${ingresos}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Comisiones</span>
            </div>
            <p className="text-xl font-bold">${comisiones}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Ganancia neta</p>
          <p className="text-3xl font-bold text-primary">${ganancia}</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1 gap-1" onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" /> Nuevo trabajo
        </Button>
        <Button variant="secondary" className="flex-1 gap-1">
          <ArrowDownCircle className="h-4 w-4" /> Gasto
        </Button>
      </div>

      <NuevoTrabajoDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  );
};

export default Caja;

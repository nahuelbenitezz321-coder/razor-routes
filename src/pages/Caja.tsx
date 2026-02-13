import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  addDays,
  subDays,
  addWeeks,
  subWeeks,
  addMonths,
  subMonths,
} from "date-fns";
import { es } from "date-fns/locale";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  CalendarIcon,
  Banknote,
  CreditCard,
  Users,
  Lock,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import NuevoTrabajoDialog from "@/components/NuevoTrabajoDialog";

type Period = "dia" | "semana" | "mes";

const Caja = () => {
  const { barberiaId, role } = useAuth();
  const queryClient = useQueryClient();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [gastoDialogOpen, setGastoDialogOpen] = useState(false);
  const [gastoDesc, setGastoDesc] = useState("");
  const [gastoMonto, setGastoMonto] = useState("");
  const [cierreDialogOpen, setCierreDialogOpen] = useState(false);

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [period, setPeriod] = useState<Period>("dia");
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Compute date range
  const dateRange = useMemo(() => {
    if (period === "dia") {
      const d = format(selectedDate, "yyyy-MM-dd");
      return { from: d, to: d };
    }
    if (period === "semana") {
      const s = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const e = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return { from: format(s, "yyyy-MM-dd"), to: format(e, "yyyy-MM-dd") };
    }
    const s = startOfMonth(selectedDate);
    const e = endOfMonth(selectedDate);
    return { from: format(s, "yyyy-MM-dd"), to: format(e, "yyyy-MM-dd") };
  }, [selectedDate, period]);

  const navigate = (dir: -1 | 1) => {
    if (period === "dia") setSelectedDate((d) => (dir === 1 ? addDays(d, 1) : subDays(d, 1)));
    else if (period === "semana") setSelectedDate((d) => (dir === 1 ? addWeeks(d, 1) : subWeeks(d, 1)));
    else setSelectedDate((d) => (dir === 1 ? addMonths(d, 1) : subMonths(d, 1)));
  };

  const dateLabel = useMemo(() => {
    if (period === "dia") return format(selectedDate, "EEEE d MMM", { locale: es });
    if (period === "semana") {
      const s = startOfWeek(selectedDate, { weekStartsOn: 1 });
      const e = endOfWeek(selectedDate, { weekStartsOn: 1 });
      return `${format(s, "d MMM", { locale: es })} – ${format(e, "d MMM", { locale: es })}`;
    }
    return format(selectedDate, "MMMM yyyy", { locale: es });
  }, [selectedDate, period]);

  // Fetch trabajos in range
  const { data: trabajos = [] } = useQuery({
    queryKey: ["caja-trabajos", barberiaId, dateRange.from, dateRange.to],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("trabajos")
        .select("*, barberos(nombre)")
        .eq("barberia_id", barberiaId)
        .gte("fecha", dateRange.from)
        .lte("fecha", dateRange.to);
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  const { data: gastos = [] } = useQuery({
    queryKey: ["caja-gastos", barberiaId, dateRange.from, dateRange.to],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("gastos")
        .select("*")
        .eq("barberia_id", barberiaId)
        .gte("fecha", dateRange.from)
        .lte("fecha", dateRange.to);
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  // Fetch cierres for history
  const { data: cierres = [] } = useQuery({
    queryKey: ["caja-cierres", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("cierres_caja")
        .select("*")
        .eq("barberia_id", barberiaId)
        .order("fecha", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  // Aggregates
  const ingresos = trabajos.reduce((s, t) => s + Number(t.precio), 0);
  const comisiones = trabajos.reduce((s, t) => s + Number(t.comision), 0);
  const totalGastos = gastos.reduce((s, g) => s + Number(g.monto), 0);
  const ganancia = ingresos - comisiones - totalGastos;

  const efectivo = trabajos.filter((t) => t.metodo_pago === "efectivo").reduce((s, t) => s + Number(t.precio), 0);
  const mercadoPago = trabajos.filter((t) => t.metodo_pago === "mercado_pago").reduce((s, t) => s + Number(t.precio), 0);

  // Barber breakdown
  const barberBreakdown = useMemo(() => {
    const map: Record<string, { nombre: string; ingresos: number; comision: number; trabajos: number }> = {};
    trabajos.forEach((t: any) => {
      const name = t.barberos?.nombre || "Desconocido";
      if (!map[t.barbero_id]) map[t.barbero_id] = { nombre: name, ingresos: 0, comision: 0, trabajos: 0 };
      map[t.barbero_id].ingresos += Number(t.precio);
      map[t.barbero_id].comision += Number(t.comision);
      map[t.barbero_id].trabajos += 1;
    });
    return Object.values(map).sort((a, b) => b.ingresos - a.ingresos);
  }, [trabajos]);

  // Gasto mutation
  const gastoMutation = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("Sin barbería");
      if (!gastoDesc.trim()) throw new Error("Descripción requerida");
      const monto = parseFloat(gastoMonto);
      if (!monto || monto <= 0) throw new Error("Monto inválido");
      const { error } = await supabase.from("gastos").insert({
        barberia_id: barberiaId,
        descripcion: gastoDesc.trim(),
        monto,
        fecha: format(selectedDate, "yyyy-MM-dd"),
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caja-gastos"] });
      toast.success("Gasto registrado");
      setGastoDesc("");
      setGastoMonto("");
      setGastoDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  // Cierre mutation
  const cierreMutation = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("Sin barbería");
      if (period !== "dia") throw new Error("Solo se puede cerrar por día");
      const fechaCierre = format(selectedDate, "yyyy-MM-dd");
      
      // Check if already closed
      const { data: existing } = await supabase
        .from("cierres_caja")
        .select("id")
        .eq("barberia_id", barberiaId)
        .eq("fecha", fechaCierre)
        .maybeSingle();
      
      if (existing) throw new Error("Este día ya fue cerrado");
      
      const { error } = await supabase.from("cierres_caja").insert({
        barberia_id: barberiaId,
        fecha: fechaCierre,
        total_ingresos: ingresos,
        total_comisiones: comisiones,
        total_gastos: totalGastos,
        ganancia_neta: ganancia,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["caja-cierres"] });
      toast.success("Caja cerrada correctamente");
      setCierreDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });


  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="mb-4 text-2xl font-bold text-primary">CAJA</h1>

      {/* Period tabs */}
      <Tabs value={period} onValueChange={(v) => setPeriod(v as Period)} className="mb-3">
        <TabsList className="w-full">
          <TabsTrigger value="dia" className="flex-1">Día</TabsTrigger>
          <TabsTrigger value="semana" className="flex-1">Semana</TabsTrigger>
          <TabsTrigger value="mes" className="flex-1">Mes</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ChevronLeft className="h-5 w-5" />
        </Button>
        <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 capitalize">
              <CalendarIcon className="h-4 w-4" />
              {dateLabel}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="center">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(d) => {
                if (d) {
                  setSelectedDate(d);
                  setCalendarOpen(false);
                }
              }}
              initialFocus
              className={cn("p-3 pointer-events-auto")}
            />
          </PopoverContent>
        </Popover>
        <Button variant="ghost" size="icon" onClick={() => navigate(1)}>
          <ChevronRight className="h-5 w-5" />
        </Button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-3 mb-3">
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

      <div className="grid grid-cols-2 gap-3 mb-4">
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Gastos</span>
            </div>
            <p className="text-xl font-bold">${totalGastos}</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <span className="text-xs text-muted-foreground">Ganancia neta</span>
            <p className={cn("text-xl font-bold", ganancia >= 0 ? "text-primary" : "text-destructive")}>
              ${ganancia}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment method breakdown */}
      <Card className="border-border bg-card mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">
            Método de pago
          </p>
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

      {/* Barber breakdown */}
      {barberBreakdown.length > 0 && (
        <Card className="border-border bg-card mb-4">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">
              <Users className="h-3.5 w-3.5 inline mr-1" />
              Por barbero
            </p>
            <div className="space-y-3">
              {barberBreakdown.map((b) => (
                <div key={b.nombre} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{b.nombre}</p>
                    <p className="text-xs text-muted-foreground">
                      {b.trabajos} trabajo{b.trabajos !== 1 ? "s" : ""} · Comisión: ${b.comision}
                    </p>
                  </div>
                  <span className="font-medium text-primary">${b.ingresos}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex flex-col gap-3 mb-6">
        <div className="flex gap-3">
          <Button className="flex-1 gap-1" onClick={() => setDialogOpen(true)}>
            <Plus className="h-4 w-4" /> Nuevo trabajo
          </Button>
          {role === "owner" && (
            <Button variant="secondary" className="flex-1 gap-1" onClick={() => setGastoDialogOpen(true)}>
              <ArrowDownCircle className="h-4 w-4" /> Gasto
            </Button>
          )}
        </div>
        {role === "owner" && period === "dia" && (
          <Button 
            variant="outline" 
            className="gap-1 border-primary text-primary hover:bg-primary/5"
            onClick={() => setCierreDialogOpen(true)}
            disabled={cierreMutation.isPending}
          >
            <Lock className="h-4 w-4" /> Cerrar caja
          </Button>
        )}
      </div>

      {/* Historial de cierres */}
      {role === "owner" && cierres.length > 0 && (
        <Card className="border-border bg-card mb-4">
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground mb-3 font-semibold uppercase tracking-wide">
              Últimos cierres
            </p>
            <div className="space-y-2">
              {cierres.slice(0, 5).map((cierre: any) => (
                <div key={cierre.id} className="flex items-center justify-between text-sm border-t pt-2 first:border-t-0 first:pt-0">
                  <div>
                    <p className="font-medium">{format(new Date(cierre.fecha), "d MMM yyyy", { locale: es })}</p>
                    <p className="text-xs text-muted-foreground">
                      Ingresos: ${cierre.total_ingresos} · Gastos: ${cierre.total_gastos}
                    </p>
                  </div>
                  <span className={cn("font-medium text-sm", cierre.ganancia_neta >= 0 ? "text-primary" : "text-destructive")}>
                    ${cierre.ganancia_neta}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <NuevoTrabajoDialog open={dialogOpen} onOpenChange={setDialogOpen} />

      {/* Gasto Dialog */}
      <Dialog open={gastoDialogOpen} onOpenChange={setGastoDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar gasto</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              gastoMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Descripción *</label>
              <Input value={gastoDesc} onChange={(e) => setGastoDesc(e.target.value)} placeholder="Ej: Productos, limpieza..." />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Monto ($) *</label>
              <Input type="number" min="0" value={gastoMonto} onChange={(e) => setGastoMonto(e.target.value)} placeholder="0" />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" type="button">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={gastoMutation.isPending}>
                {gastoMutation.isPending ? "Guardando..." : "Registrar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Cierre Dialog */}
      <Dialog open={cierreDialogOpen} onOpenChange={setCierreDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar cierre de caja</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              ¿Deseas cerrar la caja para {format(selectedDate, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}?
            </p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Ingresos</p>
                <p className="font-bold text-primary">${ingresos}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Comisiones</p>
                <p className="font-bold text-destructive">${comisiones}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Gastos</p>
                <p className="font-bold text-destructive">${totalGastos}</p>
              </div>
              <div className="border rounded-lg p-3">
                <p className="text-xs text-muted-foreground">Ganancia neta</p>
                <p className={cn("font-bold", ganancia >= 0 ? "text-primary" : "text-destructive")}>
                  ${ganancia}
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" type="button">Cancelar</Button>
            </DialogClose>
            <Button 
              onClick={() => cierreMutation.mutate()} 
              disabled={cierreMutation.isPending}
            >
              {cierreMutation.isPending ? "Cerrando..." : "Cerrar caja"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Caja;

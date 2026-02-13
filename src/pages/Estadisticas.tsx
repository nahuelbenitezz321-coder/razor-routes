import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import {
  startOfWeek, endOfWeek, subWeeks, format, eachDayOfInterval,
  startOfMonth, endOfMonth, subDays, parseISO,
} from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, Crown, Users, CalendarDays } from "lucide-react";

type Periodo = "7d" | "30d" | "90d";

const COLORS = [
  "hsl(43 74% 49%)",
  "hsl(200 70% 50%)",
  "hsl(150 60% 45%)",
  "hsl(0 62% 50%)",
  "hsl(270 60% 55%)",
  "hsl(30 80% 55%)",
];

const Estadisticas = () => {
  const { barberiaId } = useAuth();
  const [periodo, setPeriodo] = useState<Periodo>("7d");

  const diasMap: Record<Periodo, number> = { "7d": 7, "30d": 30, "90d": 90 };
  const dias = diasMap[periodo];

  const desde = format(subDays(new Date(), dias - 1), "yyyy-MM-dd");
  const hasta = format(new Date(), "yyyy-MM-dd");

  const { data: trabajos = [] } = useQuery({
    queryKey: ["stats-trabajos", barberiaId, desde, hasta],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("trabajos")
        .select("*, barberos(nombre), clientes(nombre)")
        .eq("barberia_id", barberiaId)
        .gte("fecha", desde)
        .lte("fecha", hasta)
        .order("fecha", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  const { data: barberos = [] } = useQuery({
    queryKey: ["stats-barberos", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("barberos")
        .select("id, nombre")
        .eq("barberia_id", barberiaId)
        .eq("activo", true);
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  // Weekly trends (income vs commissions per week)
  const weeklyData = useMemo(() => {
    const weeks: Record<string, { semana: string; ingresos: number; comisiones: number }> = {};
    trabajos.forEach((t) => {
      const d = parseISO(t.fecha);
      const ws = format(startOfWeek(d, { locale: es, weekStartsOn: 1 }), "dd/MM");
      if (!weeks[ws]) weeks[ws] = { semana: ws, ingresos: 0, comisiones: 0 };
      weeks[ws].ingresos += Number(t.precio);
      weeks[ws].comisiones += Number(t.comision);
    });
    return Object.values(weeks);
  }, [trabajos]);

  // Daily trend line
  const dailyData = useMemo(() => {
    const days = eachDayOfInterval({
      start: parseISO(desde),
      end: parseISO(hasta),
    });
    return days.map((day) => {
      const key = format(day, "yyyy-MM-dd");
      const dayJobs = trabajos.filter((t) => t.fecha === key);
      return {
        dia: format(day, "dd/MM"),
        ingresos: dayJobs.reduce((s, t) => s + Number(t.precio), 0),
      };
    });
  }, [trabajos, desde, hasta]);

  // Barber ranking
  const rankingBarberos = useMemo(() => {
    const map: Record<string, { nombre: string; ingresos: number; trabajos: number }> = {};
    trabajos.forEach((t) => {
      const name = (t as any).barberos?.nombre || "—";
      if (!map[t.barbero_id]) map[t.barbero_id] = { nombre: name, ingresos: 0, trabajos: 0 };
      map[t.barbero_id].ingresos += Number(t.precio);
      map[t.barbero_id].trabajos += 1;
    });
    return Object.values(map).sort((a, b) => b.ingresos - a.ingresos);
  }, [trabajos]);

  // Payment method breakdown
  const metodosPago = useMemo(() => {
    let efectivo = 0;
    let mp = 0;
    trabajos.forEach((t) => {
      if (t.metodo_pago === "mercado_pago") mp += Number(t.precio);
      else efectivo += Number(t.precio);
    });
    if (efectivo === 0 && mp === 0) return [];
    return [
      { name: "Efectivo", value: efectivo },
      { name: "Mercado Pago", value: mp },
    ].filter((m) => m.value > 0);
  }, [trabajos]);

  // Top recurring clients
  const topClientes = useMemo(() => {
    const map: Record<string, { nombre: string; visitas: number; gastado: number }> = {};
    trabajos.forEach((t) => {
      if (!t.cliente_id) return;
      const name = (t as any).clientes?.nombre || "Sin nombre";
      if (!map[t.cliente_id]) map[t.cliente_id] = { nombre: name, visitas: 0, gastado: 0 };
      map[t.cliente_id].visitas += 1;
      map[t.cliente_id].gastado += Number(t.precio);
    });
    return Object.values(map)
      .sort((a, b) => b.visitas - a.visitas)
      .slice(0, 5);
  }, [trabajos]);

  const totalIngresos = trabajos.reduce((s, t) => s + Number(t.precio), 0);
  const totalComisiones = trabajos.reduce((s, t) => s + Number(t.comision), 0);
  const promediodiario = dias > 0 ? Math.round(totalIngresos / dias) : 0;

  const tooltipStyle = {
    contentStyle: {
      background: "hsl(0 0% 11%)",
      border: "1px solid hsl(0 0% 18%)",
      borderRadius: "0.5rem",
      fontSize: "0.75rem",
      color: "hsl(0 0% 95%)",
    },
  };

  return (
    <div className="px-4 pt-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl text-primary">ESTADÍSTICAS</h1>
        <Tabs value={periodo} onValueChange={(v) => setPeriodo(v as Periodo)}>
          <TabsList className="h-8">
            <TabsTrigger value="7d" className="text-xs px-3 h-7">7D</TabsTrigger>
            <TabsTrigger value="30d" className="text-xs px-3 h-7">30D</TabsTrigger>
            <TabsTrigger value="90d" className="text-xs px-3 h-7">90D</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-2">
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 text-primary mx-auto mb-1" />
            <p className="text-lg font-bold font-sans">${totalIngresos}</p>
            <p className="text-[10px] text-muted-foreground">Ingresos</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <CalendarDays className="h-4 w-4 text-sky-400 mx-auto mb-1" />
            <p className="text-lg font-bold font-sans">{trabajos.length}</p>
            <p className="text-[10px] text-muted-foreground">Trabajos</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-3 text-center">
            <TrendingUp className="h-4 w-4 text-emerald-400 mx-auto mb-1" />
            <p className="text-lg font-bold font-sans">${promediodiario}</p>
            <p className="text-[10px] text-muted-foreground">Prom/día</p>
          </CardContent>
        </Card>
      </div>

      {/* Daily income trend */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <h2 className="text-lg text-primary mb-3">TENDENCIA DIARIA</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dailyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                <XAxis dataKey="dia" tick={{ fill: "hsl(0 0% 55%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 10 }} width={40} />
                <Tooltip {...tooltipStyle} />
                <Line
                  type="monotone"
                  dataKey="ingresos"
                  stroke="hsl(43 74% 49%)"
                  strokeWidth={2}
                  dot={false}
                  name="Ingresos"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Income vs Commissions */}
      <Card className="border-border bg-card">
        <CardContent className="p-4">
          <h2 className="text-lg text-primary mb-3">INGRESOS VS COMISIONES</h2>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(0 0% 18%)" />
                <XAxis dataKey="semana" tick={{ fill: "hsl(0 0% 55%)", fontSize: 10 }} />
                <YAxis tick={{ fill: "hsl(0 0% 55%)", fontSize: 10 }} width={40} />
                <Tooltip {...tooltipStyle} />
                <Legend
                  wrapperStyle={{ fontSize: "11px", color: "hsl(0 0% 55%)" }}
                />
                <Bar dataKey="ingresos" fill="hsl(43 74% 49%)" radius={[4, 4, 0, 0]} name="Ingresos" />
                <Bar dataKey="comisiones" fill="hsl(200 70% 50%)" radius={[4, 4, 0, 0]} name="Comisiones" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Payment method pie + Barber ranking side by side on larger, stacked on mobile */}
      <div className="grid grid-cols-1 gap-4">
        {/* Payment methods pie */}
        {metodosPago.length > 0 && (
          <Card className="border-border bg-card">
            <CardContent className="p-4">
              <h2 className="text-lg text-primary mb-3">MÉTODOS DE PAGO</h2>
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={metodosPago}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {metodosPago.map((_, i) => (
                        <Cell key={i} fill={COLORS[i]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Barber ranking */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h2 className="text-lg text-primary mb-3 flex items-center gap-2">
              <Crown className="h-5 w-5" /> RANKING BARBEROS
            </h2>
            {rankingBarberos.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos</p>
            ) : (
              <div className="space-y-2">
                {rankingBarberos.map((b, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div className="flex items-center gap-2">
                      <span className="text-primary font-bold font-sans text-lg">#{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{b.nombre}</p>
                        <p className="text-xs text-muted-foreground">{b.trabajos} trabajos</p>
                      </div>
                    </div>
                    <p className="font-bold font-sans">${b.ingresos}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top recurring clients */}
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <h2 className="text-lg text-primary mb-3 flex items-center gap-2">
              <Users className="h-5 w-5" /> CLIENTES FRECUENTES
            </h2>
            {topClientes.length === 0 ? (
              <p className="text-sm text-muted-foreground">Sin datos de clientes</p>
            ) : (
              <div className="space-y-2">
                {topClientes.map((c, i) => (
                  <div key={i} className="flex items-center justify-between rounded-lg bg-secondary p-3">
                    <div>
                      <p className="text-sm font-medium">{c.nombre}</p>
                      <p className="text-xs text-muted-foreground">{c.visitas} visitas</p>
                    </div>
                    <p className="font-bold font-sans">${c.gastado}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Estadisticas;

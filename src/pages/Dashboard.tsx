import { Scissors, DollarSign, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const stats = [
  { label: "Trabajos hoy", value: "0", icon: Scissors, color: "text-primary" },
  { label: "Ingresos hoy", value: "$0", icon: DollarSign, color: "text-emerald-400" },
  { label: "Clientes", value: "0", icon: Users, color: "text-sky-400" },
  { label: "Comisiones", value: "$0", icon: TrendingUp, color: "text-amber-400" },
];

const Dashboard = () => {
  return (
    <div className="px-4 pt-6">
      <div className="mb-6 flex items-center gap-3">
        <img src="/logo-jr.jpg" alt="JR Barbería" className="h-12 w-12 rounded-full object-cover ring-2 ring-primary" />
        <div>
          <h1 className="text-2xl text-primary">JR BARBERÍA</h1>
          <p className="text-sm text-muted-foreground">Resumen del día</p>
        </div>
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

      <Card className="mt-4 border-border bg-card">
        <CardContent className="p-4">
          <h2 className="mb-3 text-lg text-primary">ÚLTIMOS TRABAJOS</h2>
          <p className="text-sm text-muted-foreground">No hay trabajos registrados hoy</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;

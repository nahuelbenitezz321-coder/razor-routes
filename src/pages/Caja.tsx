import { Wallet, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Caja = () => {
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
            <p className="text-xl font-bold">$0</p>
          </CardContent>
        </Card>
        <Card className="border-border bg-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <ArrowDownCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-muted-foreground">Gastos</span>
            </div>
            <p className="text-xl font-bold">$0</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-card mb-4">
        <CardContent className="p-4">
          <p className="text-xs text-muted-foreground mb-1">Ganancia neta</p>
          <p className="text-3xl font-bold text-primary">$0</p>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button className="flex-1 gap-1">
          <ArrowUpCircle className="h-4 w-4" /> Nuevo trabajo
        </Button>
        <Button variant="secondary" className="flex-1 gap-1">
          <ArrowDownCircle className="h-4 w-4" /> Gasto
        </Button>
      </div>
    </div>
  );
};

export default Caja;

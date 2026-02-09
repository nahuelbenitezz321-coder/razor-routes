import { Scissors, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const Servicios = () => {
  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl text-primary">SERVICIOS</h1>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-2 p-8">
          <Scissors className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay servicios creados</p>
          <p className="text-xs text-muted-foreground">Agregá tu primer servicio</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Servicios;

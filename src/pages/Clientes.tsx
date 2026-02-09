import { Users, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

const Clientes = () => {
  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl text-primary">CLIENTES</h1>
        <Button size="sm" className="gap-1">
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input placeholder="Buscar cliente..." className="pl-9" />
      </div>
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-2 p-8">
          <Users className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">No hay clientes registrados</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Clientes;

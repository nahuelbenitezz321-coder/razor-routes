import { BarChart3 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const Estadisticas = () => {
  return (
    <div className="px-4 pt-6">
      <h1 className="mb-4 text-2xl text-primary">ESTADÍSTICAS</h1>
      <Card className="border-border bg-card">
        <CardContent className="flex flex-col items-center gap-2 p-8">
          <BarChart3 className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Las estadísticas aparecerán cuando haya datos</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Estadisticas;

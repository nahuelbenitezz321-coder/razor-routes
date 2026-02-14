import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Settings, Store, Users, KeyRound, LogOut } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const menuItems = [
  { icon: Store, label: "Datos de la barbería", desc: "Nombre, teléfono, dirección", path: "/datos-barberia" },
  { icon: Users, label: "Barberos", desc: "Gestionar equipo y comisiones", path: "/barberos" },
  { icon: KeyRound, label: "Códigos de invitación", desc: "Generar y gestionar códigos", path: "/codigos-invitacion" },
];

const Configuracion = () => {
  const { signOut, role } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/login");
  };

  return (
    <div className="px-4 pt-6">
      <h1 className="mb-4 text-2xl text-primary">CONFIGURACIÓN</h1>

      <div className="space-y-3">
        {menuItems
          .filter((item) => role === "owner" || item.label === "Datos de la barbería")
          .map((item) => (
            <Card
              key={item.label}
              className="border-border bg-card cursor-pointer hover:bg-secondary/50 transition-colors"
              onClick={() => item.path && navigate(item.path)}
            >
              <CardContent className="flex items-center gap-3 p-4">
                <item.icon className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm font-medium">{item.label}</p>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              </CardContent>
            </Card>
          ))}
      </div>

      <Button variant="destructive" className="mt-6 w-full gap-2" onClick={handleSignOut}>
        <LogOut className="h-4 w-4" /> Cerrar sesión
      </Button>
    </div>
  );
};

export default Configuracion;

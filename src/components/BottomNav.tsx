import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Scissors, Users, Wallet, Settings } from "lucide-react";

const navItems = [
  { path: "/dashboard", icon: LayoutDashboard, label: "Inicio" },
  { path: "/servicios", icon: Scissors, label: "Servicios" },
  { path: "/clientes", icon: Users, label: "Clientes" },
  { path: "/caja", icon: Wallet, label: "Caja" },
  { path: "/configuracion", icon: Settings, label: "Config" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-lg">
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-0.5 py-2 px-3 text-xs transition-colors ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;

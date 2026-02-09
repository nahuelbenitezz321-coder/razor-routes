import { Outlet } from "react-router-dom";
import BottomNav from "./BottomNav";

const AppLayout = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pb-safe">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
};

export default AppLayout;

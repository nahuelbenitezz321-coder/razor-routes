import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

const Login = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Login state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Register state
  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regCode, setRegCode] = useState("");

  // Register barberia state
  const [barberiaName, setBarberiaName] = useState("");
  const [barberiaTel, setBarberiaTel] = useState("");
  const [barberiaDir, setBarberiaDir] = useState("");

  const [tab, setTab] = useState("login");
  const [showBarberiaForm, setShowBarberiaForm] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password: loginPassword,
    });
    setLoading(false);
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regEmail.trim() || !regPassword.trim()) {
      toast.error("Completá todos los campos");
      return;
    }

    setLoading(true);

    try {
      // If no code, show barberia form
      if (!regCode.trim() && !showBarberiaForm) {
        setShowBarberiaForm(true);
        setLoading(false);
        return;
      }

      // Sign up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: regEmail,
        password: regPassword,
        options: { emailRedirectTo: window.location.origin },
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("No se pudo crear el usuario");

      const userId = authData.user.id;

      if (regCode.trim()) {
        // JOIN existing barberia via invitation code (atomic server-side)
        const { error: rpcError } = await (supabase.rpc as any)("register_barber", {
          _user_id: userId,
          _full_name: regName,
          _codigo: regCode.trim(),
        });
        if (rpcError) throw rpcError;
      } else {
        // CREATE new barberia (owner flow, atomic server-side)
        if (!barberiaName.trim()) throw new Error("El nombre de la barbería es obligatorio");

        const { error: rpcError } = await (supabase.rpc as any)("register_owner", {
          _user_id: userId,
          _full_name: regName,
          _barberia_nombre: barberiaName,
          _barberia_telefono: barberiaTel || null,
          _barberia_direccion: barberiaDir || null,
        });
        if (rpcError) throw rpcError;
      }

      toast.success("Cuenta creada. Revisá tu email para confirmar.");
      setTab("login");
      setShowBarberiaForm(false);
    } catch (err: any) {
      toast.error(err.message || "Error al registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 bg-background">
      <div className="mb-8 text-center">
        <img
          src="/logo-jr.jpg"
          alt="JR Barbería"
          className="mx-auto mb-4 h-24 w-24 rounded-full object-cover ring-4 ring-primary shadow-2xl"
        />
        <h1 className="text-4xl text-primary">JR BARBERÍA</h1>
        <p className="text-sm text-muted-foreground mt-1">Gestión integral para tu barbería</p>
      </div>

      <Card className="w-full max-w-sm border-border bg-card">
        <CardContent className="p-6">
          <Tabs value={tab} onValueChange={(v) => { setTab(v); setShowBarberiaForm(false); }}>
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Ingresar</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-3">
                <Input
                  placeholder="Email"
                  type="email"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required
                />
                <Input
                  placeholder="Contraseña"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required
                />
                <Button className="w-full" disabled={loading}>
                  {loading ? "Ingresando..." : "Ingresar"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-3">
                <Input
                  placeholder="Nombre completo"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required
                />
                <Input
                  placeholder="Email"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required
                />
                <Input
                  placeholder="Contraseña"
                  type="password"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <Input
                  placeholder="Código de invitación (opcional)"
                  value={regCode}
                  onChange={(e) => setRegCode(e.target.value)}
                />

                {showBarberiaForm && (
                  <div className="space-y-3 rounded-lg border border-border p-3">
                    <p className="text-xs text-muted-foreground">Datos de tu nueva barbería:</p>
                    <Input
                      placeholder="Nombre del local *"
                      value={barberiaName}
                      onChange={(e) => setBarberiaName(e.target.value)}
                      required
                    />
                    <Input
                      placeholder="Teléfono"
                      value={barberiaTel}
                      onChange={(e) => setBarberiaTel(e.target.value)}
                    />
                    <Input
                      placeholder="Dirección"
                      value={barberiaDir}
                      onChange={(e) => setBarberiaDir(e.target.value)}
                    />
                  </div>
                )}

                <Button className="w-full" disabled={loading}>
                  {loading
                    ? "Registrando..."
                    : showBarberiaForm
                      ? "Crear barbería y cuenta"
                      : "Continuar"}
                </Button>
                <p className="text-xs text-center text-muted-foreground">
                  {regCode.trim()
                    ? "Te unirás a la barbería del código"
                    : "Sin código, se creará una nueva barbería"}
                </p>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Store, Save, Upload } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const DatosBarberia = () => {
  const { barberiaId, role } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = role === "owner";

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const { data: barberia, isLoading } = useQuery({
    queryKey: ["barberia-datos", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return null;
      const { data, error } = await supabase
        .from("barberias")
        .select("*")
        .eq("id", barberiaId)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  useEffect(() => {
    if (barberia) {
      setNombre(barberia.nombre || "");
      setTelefono(barberia.telefono || "");
      setDireccion(barberia.direccion || "");
      setLogoUrl(barberia.logo_url || null);
    }
  }, [barberia]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("Sin barbería");
      const { error } = await supabase
        .from("barberias")
        .update({
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
          direccion: direccion.trim() || null,
          logo_url: logoUrl,
        })
        .eq("id", barberiaId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberia-datos"] });
      toast.success("Datos actualizados");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !barberiaId) return;

    setUploading(true);
    try {
      const ext = file.name.split(".").pop();
      const path = `${barberiaId}/logo.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("logos")
        .upload(path, file, { upsert: true });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from("logos").getPublicUrl(path);
      setLogoUrl(publicUrl);
      toast.success("Logo subido correctamente");
    } catch (err: any) {
      toast.error(err.message || "Error al subir logo");
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="px-4 pt-6">
        <p className="text-sm text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <div className="px-4 pt-6 pb-24">
      <h1 className="mb-4 text-2xl text-primary">DATOS DE LA BARBERÍA</h1>

      <Card className="border-border bg-card mb-4">
        <CardContent className="p-4">
          {/* Logo */}
          <div className="flex flex-col items-center gap-3 mb-6">
            <Avatar className="h-24 w-24 ring-2 ring-primary">
              <AvatarImage src={logoUrl || "/logo-jr.jpg"} alt="Logo" />
              <AvatarFallback className="bg-secondary text-2xl">
                <Store className="h-8 w-8" />
              </AvatarFallback>
            </Avatar>
            {isOwner && (
              <label className="cursor-pointer">
                <Button variant="outline" size="sm" className="gap-1 pointer-events-none" asChild>
                  <span>
                    <Upload className="h-3.5 w-3.5" />
                    {uploading ? "Subiendo..." : "Cambiar logo"}
                  </span>
                </Button>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleLogoUpload}
                  disabled={uploading}
                />
              </label>
            )}
          </div>

          {/* Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              updateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nombre *</label>
              <Input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Nombre de la barbería"
                disabled={!isOwner}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Teléfono</label>
              <Input
                value={telefono}
                onChange={(e) => setTelefono(e.target.value)}
                placeholder="Ej: +54 11 1234-5678"
                disabled={!isOwner}
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Dirección</label>
              <Input
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Ej: Av. Corrientes 1234, CABA"
                disabled={!isOwner}
              />
            </div>
            {isOwner && (
              <Button type="submit" className="w-full gap-1" disabled={updateMutation.isPending}>
                <Save className="h-4 w-4" />
                {updateMutation.isPending ? "Guardando..." : "Guardar cambios"}
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default DatosBarberia;

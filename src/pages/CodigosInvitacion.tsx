import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { KeyRound, Plus, Copy, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";

const generateCode = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
};

const CodigosInvitacion = () => {
  const { barberiaId, role } = useAuth();
  const queryClient = useQueryClient();
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { data: codigos = [], isLoading } = useQuery({
    queryKey: ["codigos-invitacion", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("codigos_invitacion")
        .select("*")
        .eq("barberia_id", barberiaId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId && role === "owner",
  });

  const crearMutation = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("Sin barbería");
      const codigo = generateCode();
      const { error } = await supabase.from("codigos_invitacion").insert({
        barberia_id: barberiaId,
        codigo,
      });
      if (error) throw error;
      return codigo;
    },
    onSuccess: (codigo) => {
      queryClient.invalidateQueries({ queryKey: ["codigos-invitacion"] });
      toast.success(`Código ${codigo} creado`);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const desactivarMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("codigos_invitacion")
        .update({ activo: false })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["codigos-invitacion"] });
      toast.success("Código desactivado");
      setConfirmDeleteId(null);
    },
    onError: (err: any) => toast.error(err.message),
  });

  const copyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Código copiado al portapapeles");
  };

  const activos = codigos.filter((c) => c.activo && !c.usado_por);
  const usados = codigos.filter((c) => c.usado_por);
  const inactivos = codigos.filter((c) => !c.activo && !c.usado_por);

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl text-primary">CÓDIGOS DE INVITACIÓN</h1>
        <Button size="sm" className="gap-1" onClick={() => crearMutation.mutate()} disabled={crearMutation.isPending}>
          <Plus className="h-4 w-4" /> Generar
        </Button>
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        Compartí estos códigos con tus barberos para que se unan a tu barbería.
      </p>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Cargando...</p>
      ) : (
        <>
          {/* Active codes */}
          {activos.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Activos</p>
              <div className="space-y-2">
                {activos.map((c) => (
                  <Card key={c.id} className="border-border bg-card">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <KeyRound className="h-5 w-5 text-primary" />
                        <span className="font-mono text-lg font-bold tracking-widest">{c.codigo}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => copyCode(c.codigo)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => setConfirmDeleteId(c.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Used codes */}
          {usados.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Usados</p>
              <div className="space-y-2">
                {usados.map((c) => (
                  <Card key={c.id} className="border-border bg-card opacity-60">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                        <span className="font-mono text-lg tracking-widest">{c.codigo}</span>
                      </div>
                      <Badge variant="secondary">Usado</Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Inactive codes */}
          {inactivos.length > 0 && (
            <div className="mb-4">
              <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wide mb-2">Desactivados</p>
              <div className="space-y-2">
                {inactivos.map((c) => (
                  <Card key={c.id} className="border-border bg-card opacity-40">
                    <CardContent className="flex items-center gap-3 p-4">
                      <KeyRound className="h-5 w-5 text-muted-foreground" />
                      <span className="font-mono text-lg tracking-widest line-through">{c.codigo}</span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {codigos.length === 0 && (
            <Card className="border-border bg-card">
              <CardContent className="p-8 text-center">
                <KeyRound className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-sm text-muted-foreground">No hay códigos generados aún</p>
                <Button className="mt-4 gap-1" onClick={() => crearMutation.mutate()} disabled={crearMutation.isPending}>
                  <Plus className="h-4 w-4" /> Generar primer código
                </Button>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Confirm deactivate dialog */}
      <Dialog open={!!confirmDeleteId} onOpenChange={() => setConfirmDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Desactivar código?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            El código ya no podrá ser usado por nadie. Esta acción no se puede deshacer.
          </p>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary">Cancelar</Button>
            </DialogClose>
            <Button
              variant="destructive"
              onClick={() => confirmDeleteId && desactivarMutation.mutate(confirmDeleteId)}
              disabled={desactivarMutation.isPending}
            >
              {desactivarMutation.isPending ? "Desactivando..." : "Desactivar"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CodigosInvitacion;

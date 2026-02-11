import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { UserPlus, Pencil, Trash2, Scissors, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface BarberoForm {
  nombre: string;
  porcentaje_comision: string;
  foto_url: string;
}

const emptyForm: BarberoForm = { nombre: "", porcentaje_comision: "50", foto_url: "" };

const Barberos = () => {
  const { barberiaId, role } = useAuth();
  const queryClient = useQueryClient();
  const isOwner = role === "owner";

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BarberoForm>(emptyForm);

  // Fetch barberos
  const { data: barberos = [], isLoading } = useQuery({
    queryKey: ["barberos", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("barberos")
        .select("*")
        .eq("barberia_id", barberiaId)
        .order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId,
  });

  // Fetch cortes count per barbero
  const { data: cortesMap = {} } = useQuery({
    queryKey: ["barberos-cortes", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return {};
      const { data, error } = await supabase
        .from("trabajos")
        .select("barbero_id")
        .eq("barberia_id", barberiaId);
      if (error) throw error;
      const map: Record<string, number> = {};
      data.forEach((t) => {
        map[t.barbero_id] = (map[t.barbero_id] || 0) + 1;
      });
      return map;
    },
    enabled: !!barberiaId,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("Sin barbería");
      const payload = {
        barberia_id: barberiaId,
        nombre: form.nombre.trim(),
        porcentaje_comision: parseFloat(form.porcentaje_comision) || 50,
        foto_url: form.foto_url.trim() || null,
      };
      if (!payload.nombre) throw new Error("El nombre es obligatorio");

      if (editingId) {
        const { error } = await supabase
          .from("barberos")
          .update(payload)
          .eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("barberos").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberos"] });
      toast.success(editingId ? "Barbero actualizado" : "Barbero agregado");
      closeDialog();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("barberos").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["barberos"] });
      toast.success("Barbero eliminado");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (b: any) => {
    setEditingId(b.id);
    setForm({
      nombre: b.nombre,
      porcentaje_comision: String(b.porcentaje_comision),
      foto_url: b.foto_url || "",
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);

  return (
    <div className="px-4 pt-6">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl text-primary">BARBEROS</h1>
        {isOwner && (
          <Button size="sm" className="gap-1" onClick={openCreate}>
            <Plus className="h-4 w-4" /> Nuevo
          </Button>
        )}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : barberos.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-2 p-8">
            <UserPlus className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">No hay barberos registrados</p>
            {isOwner && (
              <p className="text-xs text-muted-foreground">Agregá tu primer barbero</p>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {barberos.map((b) => (
            <Card key={b.id} className="border-border bg-card">
              <CardContent className="flex items-center gap-3 p-4">
                <Avatar className="h-10 w-10 ring-2 ring-primary/30">
                  <AvatarImage src={b.foto_url || undefined} alt={b.nombre} />
                  <AvatarFallback className="bg-secondary text-foreground text-sm">
                    {getInitials(b.nombre)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <p className="font-medium">{b.nombre}</p>
                  <div className="mt-0.5 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{b.porcentaje_comision}% comisión</span>
                    <span className="flex items-center gap-1">
                      <Scissors className="h-3 w-3" />
                      {(cortesMap as Record<string, number>)[b.id] || 0} cortes
                    </span>
                  </div>
                </div>
                {isOwner && (
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(b)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar barbero?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Se eliminará "{b.nombre}" permanentemente.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteMutation.mutate(b.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? "Editar barbero" : "Nuevo barbero"}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              saveMutation.mutate();
            }}
            className="space-y-4"
          >
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Nombre *</label>
              <Input
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                placeholder="Ej: Juan Pérez"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Comisión (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={form.porcentaje_comision}
                onChange={(e) => setForm({ ...form, porcentaje_comision: e.target.value })}
                placeholder="50"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">URL de foto (opcional)</label>
              <Input
                value={form.foto_url}
                onChange={(e) => setForm({ ...form, foto_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="secondary" type="button">Cancelar</Button>
              </DialogClose>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Guardando..." : "Guardar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Barberos;

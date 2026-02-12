import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Users, Plus, Search, Phone, Mail, Edit2, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface Cliente {
  id: string;
  nombre: string;
  telefono: string | null;
  email: string | null;
  notas: string | null;
  created_at: string;
}

interface ClienteStats {
  visitas: number;
  totalGastado: number;
  ultimaVisita: string | null;
}

const Clientes = () => {
  const { barberiaId, role } = useAuth();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);
  const [detailCliente, setDetailCliente] = useState<Cliente | null>(null);

  // Form state
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [notas, setNotas] = useState("");

  const { data: clientes = [], isLoading } = useQuery({
    queryKey: ["clientes", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("barberia_id", barberiaId)
        .order("nombre");
      if (error) throw error;
      return data as Cliente[];
    },
    enabled: !!barberiaId,
  });

  // Stats for detail view
  const { data: clienteStats } = useQuery({
    queryKey: ["cliente-stats", detailCliente?.id],
    queryFn: async () => {
      if (!detailCliente) return null;
      const { data, error } = await supabase
        .from("trabajos")
        .select("precio, fecha")
        .eq("cliente_id", detailCliente.id)
        .order("fecha", { ascending: false });
      if (error) throw error;
      return {
        visitas: data.length,
        totalGastado: data.reduce((sum, t) => sum + Number(t.precio), 0),
        ultimaVisita: data.length > 0 ? data[0].fecha : null,
      } as ClienteStats;
    },
    enabled: !!detailCliente,
  });

  const filtered = clientes.filter((c) =>
    c.nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.telefono?.includes(search) ||
    c.email?.toLowerCase().includes(search.toLowerCase())
  );

  const openNew = () => {
    setEditingCliente(null);
    setNombre("");
    setTelefono("");
    setEmail("");
    setNotas("");
    setDialogOpen(true);
  };

  const openEdit = (c: Cliente) => {
    setEditingCliente(c);
    setNombre(c.nombre);
    setTelefono(c.telefono || "");
    setEmail(c.email || "");
    setNotas(c.notas || "");
    setDialogOpen(true);
  };

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("Sin barbería");
      if (!nombre.trim()) throw new Error("El nombre es obligatorio");

      if (editingCliente) {
        const { error } = await supabase
          .from("clientes")
          .update({
            nombre: nombre.trim(),
            telefono: telefono.trim() || null,
            email: email.trim() || null,
            notas: notas.trim() || null,
          })
          .eq("id", editingCliente.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("clientes").insert({
          barberia_id: barberiaId,
          nombre: nombre.trim(),
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          notas: notas.trim() || null,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clientes"] });
      toast.success(editingCliente ? "Cliente actualizado" : "Cliente creado");
      setDialogOpen(false);
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div className="px-4 pt-6 pb-24">
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary">CLIENTES</h1>
        <Button size="sm" className="gap-1" onClick={openNew}>
          <Plus className="h-4 w-4" /> Nuevo
        </Button>
      </div>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o email..."
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <p className="text-center text-sm text-muted-foreground py-8">Cargando...</p>
      ) : filtered.length === 0 ? (
        <Card className="border-border bg-card">
          <CardContent className="flex flex-col items-center gap-2 p-8">
            <Users className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              {search ? "Sin resultados" : "No hay clientes registrados"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filtered.map((c) => (
            <Card
              key={c.id}
              className="border-border bg-card cursor-pointer hover:bg-accent/50 transition-colors"
              onClick={() => setDetailCliente(c)}
            >
              <CardContent className="flex items-center justify-between p-4">
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.nombre}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground mt-0.5">
                    {c.telefono && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {c.telefono}
                      </span>
                    )}
                    {c.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {c.email}
                      </span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCliente ? "Editar cliente" : "Nuevo cliente"}</DialogTitle>
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
              <Input value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Teléfono</label>
              <Input value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="Ej: 1155667788" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Notas</label>
              <Textarea value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Preferencias, observaciones..." rows={3} />
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

      {/* Detail Sheet */}
      <Sheet open={!!detailCliente} onOpenChange={(open) => !open && setDetailCliente(null)}>
        <SheetContent side="bottom" className="rounded-t-2xl max-h-[80vh]">
          {detailCliente && (
            <>
              <SheetHeader className="text-left">
                <SheetTitle className="flex items-center justify-between">
                  <span>{detailCliente.nombre}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDetailCliente(null);
                      openEdit(detailCliente);
                    }}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </SheetTitle>
              </SheetHeader>

              <div className="mt-4 space-y-4">
                {/* Contact info */}
                <div className="space-y-2 text-sm">
                  {detailCliente.telefono && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      <a href={`tel:${detailCliente.telefono}`} className="text-primary underline">
                        {detailCliente.telefono}
                      </a>
                    </div>
                  )}
                  {detailCliente.email && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      <a href={`mailto:${detailCliente.email}`} className="text-primary underline">
                        {detailCliente.email}
                      </a>
                    </div>
                  )}
                </div>

                {/* Stats */}
                {clienteStats && (
                  <div className="grid grid-cols-3 gap-3">
                    <Card className="bg-secondary border-0">
                      <CardContent className="p-3 text-center">
                        <p className="text-lg font-bold text-primary">{clienteStats.visitas}</p>
                        <p className="text-xs text-muted-foreground">Visitas</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary border-0">
                      <CardContent className="p-3 text-center">
                        <p className="text-lg font-bold text-primary">${clienteStats.totalGastado}</p>
                        <p className="text-xs text-muted-foreground">Total gastado</p>
                      </CardContent>
                    </Card>
                    <Card className="bg-secondary border-0">
                      <CardContent className="p-3 text-center">
                        <p className="text-sm font-medium text-primary">
                          {clienteStats.ultimaVisita || "—"}
                        </p>
                        <p className="text-xs text-muted-foreground">Última visita</p>
                      </CardContent>
                    </Card>
                  </div>
                )}

                {/* Notes */}
                {detailCliente.notas && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Notas</p>
                    <p className="text-sm bg-secondary rounded-lg p-3">{detailCliente.notas}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Clientes;

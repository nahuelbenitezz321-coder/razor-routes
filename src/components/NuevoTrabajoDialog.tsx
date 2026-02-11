import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const NuevoTrabajoDialog = ({ open, onOpenChange }: Props) => {
  const { barberiaId } = useAuth();
  const queryClient = useQueryClient();

  const [barberoId, setBarberoId] = useState("");
  const [servicioId, setServicioId] = useState("");
  const [precio, setPrecio] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [clienteId, setClienteId] = useState("");

  const { data: barberos = [] } = useQuery({
    queryKey: ["barberos", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("barberos")
        .select("*")
        .eq("barberia_id", barberiaId)
        .eq("activo", true)
        .order("nombre");
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId && open,
  });

  const { data: servicios = [] } = useQuery({
    queryKey: ["servicios", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("servicios")
        .select("*")
        .eq("barberia_id", barberiaId)
        .eq("activo", true)
        .order("nombre");
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId && open,
  });

  const { data: clientes = [] } = useQuery({
    queryKey: ["clientes", barberiaId],
    queryFn: async () => {
      if (!barberiaId) return [];
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .eq("barberia_id", barberiaId)
        .order("nombre");
      if (error) throw error;
      return data;
    },
    enabled: !!barberiaId && open,
  });

  // Auto-fill price when service is selected
  useEffect(() => {
    if (servicioId) {
      const servicio = servicios.find((s) => s.id === servicioId);
      if (servicio) setPrecio(String(servicio.precio));
    }
  }, [servicioId, servicios]);

  const selectedBarbero = barberos.find((b) => b.id === barberoId);
  const comisionCalculada =
    selectedBarbero && precio
      ? ((parseFloat(precio) * selectedBarbero.porcentaje_comision) / 100).toFixed(0)
      : "0";

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!barberiaId) throw new Error("Sin barbería");
      if (!barberoId) throw new Error("Seleccioná un barbero");
      if (!servicioId) throw new Error("Seleccioná un servicio");

      const precioNum = parseFloat(precio) || 0;
      const comision = selectedBarbero
        ? (precioNum * selectedBarbero.porcentaje_comision) / 100
        : 0;

      const { error } = await supabase.from("trabajos").insert({
        barberia_id: barberiaId,
        barbero_id: barberoId,
        servicio_id: servicioId,
        cliente_id: clienteId || null,
        precio: precioNum,
        comision,
        metodo_pago: metodoPago,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["trabajos"] });
      queryClient.invalidateQueries({ queryKey: ["barberos-cortes"] });
      toast.success("Trabajo registrado");
      resetAndClose();
    },
    onError: (err: any) => toast.error(err.message),
  });

  const resetAndClose = () => {
    setBarberoId("");
    setServicioId("");
    setPrecio("");
    setMetodoPago("efectivo");
    setClienteId("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo trabajo</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            saveMutation.mutate();
          }}
          className="space-y-4"
        >
          {/* Barbero */}
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Barbero *</label>
            <Select value={barberoId} onValueChange={setBarberoId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar barbero" />
              </SelectTrigger>
              <SelectContent>
                {barberos.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.nombre} ({b.porcentaje_comision}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Servicio */}
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Servicio *</label>
            <Select value={servicioId} onValueChange={setServicioId}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar servicio" />
              </SelectTrigger>
              <SelectContent>
                {servicios.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.nombre} - ${s.precio}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Precio + Método de pago */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Precio ($)</label>
              <Input
                type="number"
                min="0"
                value={precio}
                onChange={(e) => setPrecio(e.target.value)}
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-muted-foreground">Método de pago</label>
              <Select value={metodoPago} onValueChange={setMetodoPago}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="efectivo">Efectivo</SelectItem>
                  <SelectItem value="mercado_pago">Mercado Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cliente (opcional) */}
          <div>
            <label className="mb-1 block text-sm text-muted-foreground">Cliente (opcional)</label>
            <Select value={clienteId} onValueChange={setClienteId}>
              <SelectTrigger>
                <SelectValue placeholder="Sin cliente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sin cliente</SelectItem>
                {clientes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Comisión preview */}
          {barberoId && precio && (
            <div className="rounded-lg bg-secondary p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Comisión ({selectedBarbero?.porcentaje_comision}%)</span>
                <span className="font-medium text-primary">${comisionCalculada}</span>
              </div>
              <div className="flex justify-between mt-1">
                <span className="text-muted-foreground">Ganancia neta</span>
                <span className="font-medium">
                  ${(parseFloat(precio) - parseFloat(comisionCalculada)).toFixed(0)}
                </span>
              </div>
            </div>
          )}

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="secondary" type="button">Cancelar</Button>
            </DialogClose>
            <Button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? "Guardando..." : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default NuevoTrabajoDialog;

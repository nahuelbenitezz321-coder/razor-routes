
-- Create barberos table (managed by owner, not tied to auth users)
CREATE TABLE public.barberos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  barberia_id UUID NOT NULL REFERENCES public.barberias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  foto_url TEXT,
  porcentaje_comision NUMERIC NOT NULL DEFAULT 50,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.barberos ENABLE ROW LEVEL SECURITY;

-- Same barberia can view barberos
CREATE POLICY "Same barberia can view barberos"
ON public.barberos FOR SELECT
USING (barberia_id = get_user_barberia_id(auth.uid()));

-- Owner can insert barberos
CREATE POLICY "Owner can insert barberos"
ON public.barberos FOR INSERT
WITH CHECK (barberia_id = get_user_barberia_id(auth.uid()) AND has_role(auth.uid(), 'owner'::app_role));

-- Owner can update barberos
CREATE POLICY "Owner can update barberos"
ON public.barberos FOR UPDATE
USING (barberia_id = get_user_barberia_id(auth.uid()) AND has_role(auth.uid(), 'owner'::app_role));

-- Owner can delete barberos
CREATE POLICY "Owner can delete barberos"
ON public.barberos FOR DELETE
USING (barberia_id = get_user_barberia_id(auth.uid()) AND has_role(auth.uid(), 'owner'::app_role));

-- Add metodo_pago to trabajos for future use
ALTER TABLE public.trabajos ADD COLUMN metodo_pago TEXT NOT NULL DEFAULT 'efectivo';

-- Add email to clientes for future use
ALTER TABLE public.clientes ADD COLUMN email TEXT;

-- Update trabajos FK: drop old FK to profiles, add FK to barberos
ALTER TABLE public.trabajos DROP CONSTRAINT trabajos_barbero_id_fkey;
ALTER TABLE public.trabajos ADD CONSTRAINT trabajos_barbero_id_fkey FOREIGN KEY (barbero_id) REFERENCES public.barberos(id);

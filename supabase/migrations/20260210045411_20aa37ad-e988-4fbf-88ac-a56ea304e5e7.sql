
-- Enum for roles
CREATE TYPE public.app_role AS ENUM ('owner', 'barber');

-- Enum for commission type
CREATE TYPE public.commission_type AS ENUM ('percentage', 'fixed');

-- Barberías table
CREATE TABLE public.barberias (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre TEXT NOT NULL,
  telefono TEXT,
  direccion TEXT,
  logo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.barberias ENABLE ROW LEVEL SECURITY;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  barberia_id UUID REFERENCES public.barberias(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  commission_type commission_type NOT NULL DEFAULT 'percentage',
  commission_value NUMERIC NOT NULL DEFAULT 50,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- User roles table (separate as required)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.get_user_barberia_id(_user_id UUID)
RETURNS UUID
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT barberia_id FROM public.profiles WHERE user_id = _user_id LIMIT 1
$$;

-- Servicios
CREATE TABLE public.servicios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barberia_id UUID NOT NULL REFERENCES public.barberias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  precio NUMERIC NOT NULL DEFAULT 0,
  duracion_min INTEGER NOT NULL DEFAULT 30,
  activo BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.servicios ENABLE ROW LEVEL SECURITY;

-- Clientes
CREATE TABLE public.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barberia_id UUID NOT NULL REFERENCES public.barberias(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  telefono TEXT,
  notas TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.clientes ENABLE ROW LEVEL SECURITY;

-- Trabajos
CREATE TABLE public.trabajos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barberia_id UUID NOT NULL REFERENCES public.barberias(id) ON DELETE CASCADE,
  barbero_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  cliente_id UUID REFERENCES public.clientes(id) ON DELETE SET NULL,
  servicio_id UUID NOT NULL REFERENCES public.servicios(id) ON DELETE CASCADE,
  precio NUMERIC NOT NULL,
  comision NUMERIC NOT NULL DEFAULT 0,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.trabajos ENABLE ROW LEVEL SECURITY;

-- Gastos
CREATE TABLE public.gastos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barberia_id UUID NOT NULL REFERENCES public.barberias(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  monto NUMERIC NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.gastos ENABLE ROW LEVEL SECURITY;

-- Cierres de caja
CREATE TABLE public.cierres_caja (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barberia_id UUID NOT NULL REFERENCES public.barberias(id) ON DELETE CASCADE,
  fecha DATE NOT NULL,
  total_ingresos NUMERIC NOT NULL DEFAULT 0,
  total_gastos NUMERIC NOT NULL DEFAULT 0,
  total_comisiones NUMERIC NOT NULL DEFAULT 0,
  ganancia_neta NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(barberia_id, fecha)
);
ALTER TABLE public.cierres_caja ENABLE ROW LEVEL SECURITY;

-- Códigos de invitación
CREATE TABLE public.codigos_invitacion (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  barberia_id UUID NOT NULL REFERENCES public.barberias(id) ON DELETE CASCADE,
  codigo TEXT NOT NULL UNIQUE,
  activo BOOLEAN NOT NULL DEFAULT true,
  usado_por UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.codigos_invitacion ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- user_roles: users can read their own roles
CREATE POLICY "Users can read own roles" ON public.user_roles
  FOR SELECT TO authenticated USING (user_id = auth.uid());

-- barberias: members can read their own barberia
CREATE POLICY "Members can view their barberia" ON public.barberias
  FOR SELECT TO authenticated
  USING (id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Owners can update their barberia" ON public.barberias
  FOR UPDATE TO authenticated
  USING (id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Anyone can insert barberia on registration" ON public.barberias
  FOR INSERT TO authenticated WITH CHECK (true);

-- profiles: same barberia can view, own profile can update
CREATE POLICY "Same barberia can view profiles" ON public.profiles
  FOR SELECT TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated USING (user_id = auth.uid());

-- servicios: same barberia can read, owner can CUD
CREATE POLICY "Same barberia can view servicios" ON public.servicios
  FOR SELECT TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Owner can insert servicios" ON public.servicios
  FOR INSERT TO authenticated
  WITH CHECK (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can update servicios" ON public.servicios
  FOR UPDATE TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can delete servicios" ON public.servicios
  FOR DELETE TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

-- clientes: same barberia
CREATE POLICY "Same barberia can view clientes" ON public.clientes
  FOR SELECT TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Same barberia can insert clientes" ON public.clientes
  FOR INSERT TO authenticated
  WITH CHECK (barberia_id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Same barberia can update clientes" ON public.clientes
  FOR UPDATE TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()));

-- trabajos: same barberia can view, barbers see only their own for insert
CREATE POLICY "Same barberia can view trabajos" ON public.trabajos
  FOR SELECT TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Same barberia can insert trabajos" ON public.trabajos
  FOR INSERT TO authenticated
  WITH CHECK (barberia_id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Owner can delete trabajos" ON public.trabajos
  FOR DELETE TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

-- gastos: owner only
CREATE POLICY "Same barberia can view gastos" ON public.gastos
  FOR SELECT TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()));

CREATE POLICY "Owner can insert gastos" ON public.gastos
  FOR INSERT TO authenticated
  WITH CHECK (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can delete gastos" ON public.gastos
  FOR DELETE TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

-- cierres_caja: owner only
CREATE POLICY "Owner can view cierres" ON public.cierres_caja
  FOR SELECT TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can insert cierres" ON public.cierres_caja
  FOR INSERT TO authenticated
  WITH CHECK (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

-- codigos_invitacion: owner manages, anyone can read active codes for registration
CREATE POLICY "Owner can view codes" ON public.codigos_invitacion
  FOR SELECT TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can insert codes" ON public.codigos_invitacion
  FOR INSERT TO authenticated
  WITH CHECK (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

CREATE POLICY "Owner can update codes" ON public.codigos_invitacion
  FOR UPDATE TO authenticated
  USING (barberia_id = public.get_user_barberia_id(auth.uid()) AND public.has_role(auth.uid(), 'owner'));

-- Allow anon to check invitation codes during registration
CREATE POLICY "Anyone can check active codes" ON public.codigos_invitacion
  FOR SELECT TO anon
  USING (activo = true AND usado_por IS NULL);

-- Trigger to auto-create profile on signup is NOT needed here since
-- we handle it in the registration flow explicitly

-- Storage bucket for logos
INSERT INTO storage.buckets (id, name, public) VALUES ('logos', 'logos', true);

CREATE POLICY "Anyone can view logos" ON storage.objects
  FOR SELECT USING (bucket_id = 'logos');

CREATE POLICY "Authenticated users can upload logos" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'logos');

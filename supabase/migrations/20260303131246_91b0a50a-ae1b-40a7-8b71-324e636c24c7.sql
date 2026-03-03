
-- Function to register an owner (creates barberia + profile + role)
CREATE OR REPLACE FUNCTION public.register_owner(
  _user_id uuid,
  _full_name text,
  _barberia_nombre text,
  _barberia_telefono text DEFAULT NULL,
  _barberia_direccion text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _barberia_id uuid;
BEGIN
  -- Create barberia
  INSERT INTO public.barberias (nombre, telefono, direccion)
  VALUES (_barberia_nombre, _barberia_telefono, _barberia_direccion)
  RETURNING id INTO _barberia_id;

  -- Create profile
  INSERT INTO public.profiles (user_id, barberia_id, full_name)
  VALUES (_user_id, _barberia_id, _full_name);

  -- Assign owner role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'owner');
END;
$$;

-- Function to register a barber (validates code + creates profile + role)
CREATE OR REPLACE FUNCTION public.register_barber(
  _user_id uuid,
  _full_name text,
  _codigo text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _code_record RECORD;
BEGIN
  -- Find and validate code
  SELECT id, barberia_id INTO _code_record
  FROM public.codigos_invitacion
  WHERE codigo = _codigo AND activo = true AND usado_por IS NULL;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Código de invitación inválido o ya usado';
  END IF;

  -- Create profile
  INSERT INTO public.profiles (user_id, barberia_id, full_name)
  VALUES (_user_id, _code_record.barberia_id, _full_name);

  -- Assign barber role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, 'barber');

  -- Mark code as used
  UPDATE public.codigos_invitacion
  SET usado_por = _user_id, activo = false
  WHERE id = _code_record.id;
END;
$$;

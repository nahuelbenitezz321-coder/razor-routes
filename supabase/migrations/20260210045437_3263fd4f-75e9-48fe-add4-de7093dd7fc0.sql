
-- Tighten the barberia insert policy: only users without a barberia can create one
DROP POLICY "Anyone can insert barberia on registration" ON public.barberias;

CREATE POLICY "Users without barberia can create one" ON public.barberias
  FOR INSERT TO authenticated
  WITH CHECK (public.get_user_barberia_id(auth.uid()) IS NULL);

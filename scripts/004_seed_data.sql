-- Insertar categorías iniciales
INSERT INTO public.categories (name, description) VALUES
  ('Herramientas Manuales', 'Martillos, destornilladores, llaves, etc.'),
  ('Herramientas Eléctricas', 'Taladros, sierras, lijadoras, etc.'),
  ('Materiales de Construcción', 'Cemento, arena, ladrillos, etc.'),
  ('Plomería', 'Tubos, llaves, accesorios de plomería'),
  ('Electricidad', 'Cables, enchufes, interruptores'),
  ('Pintura', 'Pinturas, brochas, rodillos'),
  ('Ferretería General', 'Tornillos, clavos, tuercas, pernos')
ON CONFLICT (name) DO NOTHING;

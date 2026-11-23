-- C-01: extensiones requeridas por el modelo.
-- btree_gist permite combinar igualdad (profesional_id, sillon_id) con superposición de rangos (&&)
-- en las restricciones EXCLUDE de la tabla turno (C-07).
CREATE EXTENSION IF NOT EXISTS btree_gist;

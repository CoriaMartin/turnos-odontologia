-- C-05: catálogo de prestaciones.

CREATE TABLE prestacion (
    id               bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           text        NOT NULL CHECK (length(nombre) <= 100),
    duracion_minutos integer     NOT NULL CHECK (duracion_minutos BETWEEN 5 AND 480),
    activa           boolean     NOT NULL DEFAULT true,
    creado_en        timestamptz NOT NULL DEFAULT now(),
    actualizado_en   timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX prestacion_nombre_lower_uk ON prestacion (lower(nombre));

INSERT INTO prestacion (nombre, duracion_minutos) VALUES
    ('Consulta/control', 30),
    ('Limpieza', 45),
    ('Obturación', 45),
    ('Extracción', 45),
    ('Tratamiento de conducto', 90);

-- C-03: entidades base del consultorio.
-- Convención: cadenas como text + CHECK (length) en lugar de varchar (knowledge-base/04).

CREATE TABLE usuario (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    email          text        NOT NULL CHECK (length(email) <= 254),
    password_hash  text        NOT NULL CHECK (length(password_hash) <= 100),
    rol            text        NOT NULL CHECK (rol IN ('ODONTOLOGO')),
    activo         boolean     NOT NULL DEFAULT true,
    creado_en      timestamptz NOT NULL DEFAULT now(),
    actualizado_en timestamptz NOT NULL DEFAULT now()
);
-- Email único sin distinguir mayúsculas.
CREATE UNIQUE INDEX usuario_email_lower_uk ON usuario (lower(email));

CREATE TABLE profesional (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    usuario_id     bigint      NOT NULL UNIQUE REFERENCES usuario (id) ON DELETE RESTRICT,
    nombre         text        NOT NULL CHECK (length(nombre) <= 100),
    apellido       text        NOT NULL CHECK (length(apellido) <= 100),
    matricula      text        CHECK (length(matricula) <= 30),
    creado_en      timestamptz NOT NULL DEFAULT now(),
    actualizado_en timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE sillon (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre         text        NOT NULL UNIQUE CHECK (length(nombre) <= 50),
    activo         boolean     NOT NULL DEFAULT true,
    creado_en      timestamptz NOT NULL DEFAULT now(),
    actualizado_en timestamptz NOT NULL DEFAULT now()
);

-- Fila única: id fijo en 1.
CREATE TABLE configuracion (
    id                              smallint    PRIMARY KEY CHECK (id = 1),
    horas_cancelacion_tardia        integer     NOT NULL DEFAULT 24 CHECK (horas_cancelacion_tardia >= 0),
    horas_anticipacion_recordatorio integer     NOT NULL DEFAULT 24 CHECK (horas_anticipacion_recordatorio > 0),
    zona_horaria                    text        NOT NULL DEFAULT 'America/Argentina/Buenos_Aires'
                                                CHECK (length(zona_horaria) <= 50),
    creado_en                       timestamptz NOT NULL DEFAULT now(),
    actualizado_en                  timestamptz NOT NULL DEFAULT now()
);

-- Seed. El usuario y el profesional los crea el bootstrap de C-04 desde variables de entorno.
INSERT INTO sillon (nombre) VALUES ('Sillón 1');
INSERT INTO configuracion (id) VALUES (1);

-- C-06: pacientes. Datos personales sensibles (Ley 25.326): nunca datos reales en seeds ni tests.

-- Búsqueda sin tildes. unaccent es una extensión "trusted": la crea el dueño de la base.
CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE paciente (
    id                   bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre               text        NOT NULL CHECK (length(nombre) <= 100),
    apellido             text        NOT NULL CHECK (length(apellido) <= 100),
    dni                  text        NOT NULL CHECK (dni ~ '^[0-9]{7,8}$'),
    fecha_nacimiento     date,
    telefono             text        CHECK (length(telefono) <= 30),
    email                text        CHECK (length(email) <= 254),
    obra_social          text        CHECK (length(obra_social) <= 100),
    numero_afiliado      text        CHECK (length(numero_afiliado) <= 50),
    acepta_recordatorios boolean     NOT NULL DEFAULT false,
    activo               boolean     NOT NULL DEFAULT true,
    creado_en            timestamptz NOT NULL DEFAULT now(),
    actualizado_en       timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT paciente_dni_uk UNIQUE (dni)
);

-- Listado de activos ordenado por apellido y nombre.
CREATE INDEX paciente_listado_idx ON paciente (activo, lower(apellido), lower(nombre));

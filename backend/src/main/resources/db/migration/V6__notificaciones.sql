-- C-13: registro de recordatorios por email (RN-RE).
CREATE TABLE notificacion (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    turno_id bigint NOT NULL REFERENCES turno (id),
    canal text NOT NULL CHECK (canal = 'EMAIL'),
    tipo text NOT NULL CHECK (tipo = 'RECORDATORIO'),
    estado text NOT NULL CHECK (estado IN ('ENVIADA', 'FALLIDA')),
    intentos integer NOT NULL CHECK (intentos BETWEEN 1 AND 3),
    destinatario text NOT NULL CHECK (length(destinatario) BETWEEN 1 AND 254),
    enviada_en timestamptz,
    error text CHECK (length(error) <= 500),
    creado_en timestamptz NOT NULL DEFAULT now(),
    actualizado_en timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT notificacion_turno_tipo_uk UNIQUE (turno_id, tipo),
    CONSTRAINT notificacion_resultado_ck CHECK (
        (estado = 'ENVIADA' AND enviada_en IS NOT NULL AND error IS NULL)
        OR (estado = 'FALLIDA' AND enviada_en IS NULL)
    )
);

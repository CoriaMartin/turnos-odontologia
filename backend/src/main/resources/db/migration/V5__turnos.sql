-- C-07: turnos sin solapamiento por profesional ni por sillón (RN-AG-01..04, DD-03, DD-09).
-- Las EXCLUDE garantizan la regla aun con transacciones simultáneas; requieren btree_gist (V1).

CREATE TABLE turno (
    id                 bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    paciente_id        bigint      NOT NULL REFERENCES paciente (id),
    profesional_id     bigint      NOT NULL REFERENCES profesional (id),
    sillon_id          bigint      NOT NULL REFERENCES sillon (id),
    prestacion_id      bigint      NOT NULL REFERENCES prestacion (id),
    inicio             timestamptz NOT NULL,
    fin                timestamptz NOT NULL,
    estado             text        NOT NULL DEFAULT 'PROGRAMADO'
                                   CHECK (estado IN ('PROGRAMADO', 'ATENDIDO', 'AUSENTE', 'CANCELADO', 'CANCELADO_TARDIO')),
    motivo_cancelacion text        CHECK (length(motivo_cancelacion) <= 255),
    cancelado_en       timestamptz,
    observaciones      text        CHECK (length(observaciones) <= 500),
    version            integer     NOT NULL DEFAULT 0,
    creado_en          timestamptz NOT NULL DEFAULT now(),
    actualizado_en     timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT turno_intervalo_ck CHECK (fin > inicio),
    -- Intervalos semiabiertos [inicio, fin): un turno que empieza cuando termina otro no colisiona.
    -- Solo cuentan los estados que ocupan horario (los cancelados liberan el horario, RN-AG-10).
    CONSTRAINT turno_sin_solape_profesional EXCLUDE USING gist (
        profesional_id WITH =,
        tstzrange(inicio, fin, '[)') WITH &&
    ) WHERE (estado IN ('PROGRAMADO', 'ATENDIDO', 'AUSENTE')),
    CONSTRAINT turno_sin_solape_sillon EXCLUDE USING gist (
        sillon_id WITH =,
        tstzrange(inicio, fin, '[)') WITH &&
    ) WHERE (estado IN ('PROGRAMADO', 'ATENDIDO', 'AUSENTE'))
);

-- Índices de FK y de consulta por fecha (los de profesional y sillón los cubren los GiST de exclusión).
CREATE INDEX turno_inicio_idx ON turno (inicio);
CREATE INDEX turno_paciente_idx ON turno (paciente_id, inicio);
CREATE INDEX turno_prestacion_idx ON turno (prestacion_id);

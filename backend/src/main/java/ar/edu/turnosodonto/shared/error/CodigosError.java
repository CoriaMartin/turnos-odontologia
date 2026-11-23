package ar.edu.turnosodonto.shared.error;

/** Códigos genéricos de error (spec api-errors). Los de negocio los define cada módulo. */
public final class CodigosError {

    public static final String RECURSO_NO_ENCONTRADO = "RECURSO_NO_ENCONTRADO";
    public static final String SOLICITUD_INVALIDA = "SOLICITUD_INVALIDA";
    public static final String VALIDACION_FALLIDA = "VALIDACION_FALLIDA";
    public static final String ERROR_INTERNO = "ERROR_INTERNO";

    private CodigosError() {
    }
}

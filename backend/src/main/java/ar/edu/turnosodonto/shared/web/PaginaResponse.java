package ar.edu.turnosodonto.shared.web;

import java.util.List;
import java.util.function.Function;

import org.springframework.data.domain.Page;

/** Formato común de los listados paginados de la API. */
public record PaginaResponse<T>(
        List<T> contenido, int pagina, int tamanio, long totalElementos, int totalPaginas) {

    public static <E, T> PaginaResponse<T> de(Page<E> pagina, Function<E, T> mapeo) {
        return new PaginaResponse<>(
                pagina.getContent().stream().map(mapeo).toList(),
                pagina.getNumber(),
                pagina.getSize(),
                pagina.getTotalElements(),
                pagina.getTotalPages());
    }
}

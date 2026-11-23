import { useEffect } from 'react';
import { BRAND_NAME } from './brand';

/** Pone el título de la pestaña como "<página> · <marca>". */
export function useTituloDePagina(pagina: string): void {
  useEffect(() => {
    document.title = `${pagina} · ${BRAND_NAME}`;
  }, [pagina]);
}

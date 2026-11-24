import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

/*
 * Solo para tests: React Router (data router) crea un `Request` nativo de Node al navegar y le pasa el
 * `AbortSignal` de jsdom, que Node rechaza ("Expected signal to be an instance of AbortSignal").
 * Se descarta la señal al construir el Request; el resto de la navegación se prueba igual.
 * Ver https://github.com/remix-run/react-router/issues/10375
 */
const RequestNativo = globalThis.Request;
class RequestDeTest extends RequestNativo {
  constructor(input: RequestInfo | URL, init?: RequestInit) {
    if (init?.signal) {
      const { signal: _descartada, ...resto } = init;
      super(input, resto);
    } else {
      super(input, init);
    }
  }
}
globalThis.Request = RequestDeTest;

import './app/estilos';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AppProviders } from './app/AppProviders';
import { crearQueryClient } from './app/queryClient';
import { crearRouter } from './app/router';

const contenedor = document.getElementById('root');
if (!contenedor) {
  throw new Error('No se encontró el elemento #root en index.html');
}

createRoot(contenedor).render(
  <StrictMode>
    <AppProviders router={crearRouter()} queryClient={crearQueryClient()} />
  </StrictMode>,
);

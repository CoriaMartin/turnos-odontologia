import { QueryClientProvider, type QueryClient } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import type { crearRouter } from './router';

interface AppProvidersProps {
  router: ReturnType<typeof crearRouter>;
  queryClient: QueryClient;
}

/** Proveedores comunes de la app: TanStack Query y React Router. */
export function AppProviders({ router, queryClient }: AppProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </QueryClientProvider>
  );
}

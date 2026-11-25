# Evidencia C-18 · UI Configuración de Recordatorios

Fecha: 2026-11-24

## Entorno

- Docker Server `27.2.0`; contenedor temporal `turnos-c18-pg` con imagen `postgres:15` (PostgreSQL `15.20`), puerto `5432`, base `turnos`, usuario/password locales de verificación.
- Backend: `.\mvnw.cmd spring-boot:run` en `backend/`, puerto `8080`, `/actuator/health` → `200`. Flyway aplicó `V1` a `V6` desde un schema vacío. Perfil por defecto; usuario inicial creado desde variables de entorno locales.
- Frontend: `npm run dev` en `frontend/`, Vite `5.4.21`, puerto `5173` → `200`.
- `MAIL_ENABLED=false`; no se enviaron emails reales.
- Se usaron credenciales locales temporales. No se versionan valores secretos.
- Cierre: `npm run verify` en `frontend/` → typecheck, 33 archivos de test, 321 tests y build en verde.

## Datos de verificación

- 5 pacientes ficticios vía `POST /api/pacientes` (DNI `30000001` a `30000005`) y 5 turnos futuros el `2026-11-26` de `10:00` a `14:00`, `America/Argentina/Buenos_Aires`, prestación `Consulta/control`.
- Se insertaron dos registros en `notificacion` para cubrir estados terminales: turno 4 `ENVIADA` (1 intento) y turno 5 `FALLIDA` (3 intentos).
- Los estados devueltos por `GET /api/turnos/{id}/notificaciones` fueron:
  - turno 1 → `PENDIENTE`
  - turno 2 → `NO_CONSENTIDO`
  - turno 3 → `NO_APLICA`
  - turno 4 → `ENVIADA`
  - turno 5 → `FALLIDA`

## 4.2 Verificación funcional

| Caso | Resultado |
|---|---|
| Login con el usuario inicial y navegación a `/configuracion` | Sesión iniciada; la barra muestra “Configuración” y la ruta es accesible |
| Carga inicial de configuración | `GET /api/configuracion` → `200`; valores `24` / `24`, zona `America/Argentina/Buenos_Aires` |
| Guardado válido | `PUT /api/configuracion` con `{"horasCancelacionTardia":24,"horasAnticipacionRecordatorio":24}` → `200`; aviso “Configuración guardada / La configuración se guardó correctamente.” |
| Persistencia | `GET /api/configuracion` posterior devuelve `24` / `24` |
| Autorización | La request `PUT` incluye `Authorization: Bearer <token>`; no se registra el valor del token |
| Horas inválidas | Con cancelación `-1` y recordatorio `0`: sin `PUT`, mensajes “Debe ser ≥ 0” y “Debe ser > 0”, `aria-invalid=true`, foco en el primer campo inválido y valores conservados |
| Guardando | Con la `PUT` retardada a propósito: botón “Guardando...” deshabilitado y región con estado ocupado |
| Estados del recordatorio en el detalle | Los cinco turnos mostraron, en orden, “Pendiente”, “No consentido”, “No aplica”, “Enviado” y “Fallido” |

## 4.3 Capturas

Todas las capturas están en `mockups/verify/`, a `390x844` y `1440x900`, sin archivos sueltos en la raíz del repo.

| Pantalla / estado | Móvil | Escritorio |
|---|---|---|
| Inicio con sesión y “Configuración” en la barra | [inicio-con-sesion-mobile-390x844.png](mockups/verify/inicio-con-sesion-mobile-390x844.png) | [inicio-con-sesion-desktop-1440x900.png](mockups/verify/inicio-con-sesion-desktop-1440x900.png) |
| Configuración cargando | [configuracion-cargando-mobile-390x844.png](mockups/verify/configuracion-cargando-mobile-390x844.png) | [configuracion-cargando-desktop-1440x900.png](mockups/verify/configuracion-cargando-desktop-1440x900.png) |
| Formulario completo | [configuracion-completa-mobile-390x844.png](mockups/verify/configuracion-completa-mobile-390x844.png) | [configuracion-completa-desktop-1440x900.png](mockups/verify/configuracion-completa-desktop-1440x900.png) |
| Error de validación | [configuracion-error-validacion-mobile-390x844.png](mockups/verify/configuracion-error-validacion-mobile-390x844.png) | [configuracion-error-validacion-desktop-1440x900.png](mockups/verify/configuracion-error-validacion-desktop-1440x900.png) |
| Guardando | [configuracion-guardando-mobile-390x844.png](mockups/verify/configuracion-guardando-mobile-390x844.png) | [configuracion-guardando-desktop-1440x900.png](mockups/verify/configuracion-guardando-desktop-1440x900.png) |
| Guardado exitoso | [configuracion-guardada-mobile-390x844.png](mockups/verify/configuracion-guardada-mobile-390x844.png) | [configuracion-guardada-desktop-1440x900.png](mockups/verify/configuracion-guardada-desktop-1440x900.png) |
| Detalle de turno con recordatorio | [turno-detalle-recordatorio-mobile-390x844.png](mockups/verify/turno-detalle-recordatorio-mobile-390x844.png) | [turno-detalle-recordatorio-desktop-1440x900.png](mockups/verify/turno-detalle-recordatorio-desktop-1440x900.png) |

## Consola y red

- Consola: `0` errores y `0` warnings. Único mensaje informativo: sugerencia de React DevTools en desarrollo.
- Red: todas las respuestas finales relevantes fueron `200`; el `PUT` de guardado fue `200`.
- Aparecen varios `net::ERR_ABORTED` seguidos de un `200` idéntico en `GET /api/turnos`, `GET /api/turnos/{id}/notificaciones` y `GET /api/configuracion`; corresponden al doble montaje de React StrictMode en desarrollo. No hay fallos funcionales ni 4xx/5xx.

## Comparación con la maqueta aprobada

- Revisión de diseño: 2; aprobación en `mockups/README.md`: `approved (2026-11-24, by user)`.
- Las capturas aprobadas están directamente en `mockups/` (no en `mockups/previews/`); `design.md` y `tasks.md` se ajustan a esa ruta real.
- Sin diferencias bloqueantes ni mayores. Estados, textos, foco, atributos ARIA, tokens y distribución responsive coinciden con las maquetas.
- Diferencias menores aceptadas:
  - Las etiquetas implementadas son “Horas de cancelación tardía” y “Horas de anticipación del recordatorio”; las maquetas usan “Horas cancelación tardía” y “Horas recordatorio”. Mismo significado y más claridad para el usuario.
  - El aviso de error implementado dice “Revisá las horas cargadas...”; la maqueta usa “Verifique los campos señalados...”. Se prefiere el texto rioplatense de la app, según D4 y `brand.md`.
  - La navegación resalta “Configuración” en la app; la maqueta de configuración resalta “Pacientes” por reutilización del layout. El estado activo de la app es el correcto para esta pantalla.
- Inspección visual: se generaron y guardaron las 14 capturas y se compararon los estados por DOM, texto, ARIA y estilos con tokens. La interpretación pixel a pixel de las imágenes no quedó automatizada; queda checklist manual para el usuario en las rutas listadas arriba. Por eso `Visual verify` se registra como `manual (2026-11-24)`.

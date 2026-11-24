# Maqueta C-14 · Inicio de sesión

Approval: approved (2026-11-23, by líder; incluye las decisiones 2 —avisos con colores de tokens— y 3 —aviso fijo de 15 minutos—)
Design system revision: 2
Preview: rendered (2026-11-23, Playwright, Chromium, 390x844 y 1440x900, capturas de a una)
Autoría: Agus, en lugar de Ludmi, con el ok del equipo. La aprobación es del líder antes del apply.

## Brief

- **Público y tarea**: el odontólogo abre la web app y tiene que entrar rápido a su agenda. Si algo falla, el mensaje le dice qué pasó y qué hacer, sin códigos técnicos.
- **Pantallas y estados**: login vacío, error de credenciales (401), bloqueo por intentos (429), cargando, más tres que pide el scope de C-14 y que conviene aprobar junto con los anteriores: campos incompletos, sesión vencida e inicio con "Cerrar sesión" en la barra.
- **Tamaños**: 390x844 (móvil) y 1440x900 (escritorio).
- **Fuentes**: `design-system/components.html` §Inicio de sesión (tarjeta, marca con logo de 40 px, campos y botón "Ingresar"), §Mensajes (avisos), §Campos (`.field.invalid`) y §Botones (spinner). Tono de los textos según `design-system/brand.md`: segunda persona con "vos", qué pasó y qué hacer.
- **Marca**: nombre de `design-system/brand.js` y logo de `design-system/assets/logo.svg` (revisión 2 aprobada). Sin imágenes: la marca dice que no hay fotos en el MVP.
- **Datos**: ficticios (`consultorio@ejemplo.com`).

## Decisiones para revisar

1. **Login sin barra superior**: la tarjeta centrada ya lleva logo y nombre; la barra con "Cerrar sesión" solo aparece con sesión iniciada.
2. **Avisos con colores de tokens**: `components.html` usa tres hexadecimales sueltos en `.alert-danger` y `.alert-info`. La regla dura del proyecto los prohíbe en el frontend, así que acá el borde es `--color-danger-700` / `--color-info-700` y el texto `--color-ink-900`. El borde queda un poco más marcado que en la referencia.
3. **Bloqueo sin cuenta regresiva**: el backend no informa el tiempo restante, así que el aviso dice siempre 15 minutos (RN-AU-03) y el botón sigue activo.
4. **Error de credenciales genérico**: no dice si falló el email o la contraseña. Se vacía la contraseña y se conserva el email.
5. **Cargando**: el botón pasa a "Ingresando…" con spinner y `aria-busy`, y los campos quedan de solo lectura (fondo `--color-sunken`).
6. **Barra en móvil**: a menos de 480 px el nombre baja a `--text-md` para que entre completo junto a "Cerrar sesión" (en la primera captura se cortaba como "Agenda de Odonto…").

## Pantallas

| Estado | HTML | Móvil | Escritorio |
|---|---|---|---|
| Login vacío | [login-vacio.html](login-vacio.html) | [móvil](previews/login-vacio-mobile-390x844.png) | [escritorio](previews/login-vacio-desktop-1440x900.png) |
| Error de credenciales | [login-error-credenciales.html](login-error-credenciales.html) | [móvil](previews/login-error-credenciales-mobile-390x844.png) | [escritorio](previews/login-error-credenciales-desktop-1440x900.png) |
| Bloqueo por intentos (429) | [login-bloqueado.html](login-bloqueado.html) | [móvil](previews/login-bloqueado-mobile-390x844.png) | [escritorio](previews/login-bloqueado-desktop-1440x900.png) |
| Cargando | [login-cargando.html](login-cargando.html) | [móvil](previews/login-cargando-mobile-390x844.png) | [escritorio](previews/login-cargando-desktop-1440x900.png) |
| Campos incompletos (extra) | [login-campos-incompletos.html](login-campos-incompletos.html) | [móvil](previews/login-campos-incompletos-mobile-390x844.png) | [escritorio](previews/login-campos-incompletos-desktop-1440x900.png) |
| Sesión vencida (extra) | [login-sesion-vencida.html](login-sesion-vencida.html) | [móvil](previews/login-sesion-vencida-mobile-390x844.png) | [escritorio](previews/login-sesion-vencida-desktop-1440x900.png) |
| Inicio con sesión (extra) | [inicio-con-sesion.html](inicio-con-sesion.html) | [móvil](previews/inicio-con-sesion-mobile-390x844.png) | [escritorio](previews/inicio-con-sesion-desktop-1440x900.png) |

El rótulo gris de la esquina inferior derecha ("Maqueta C-14 · …") solo identifica el estado en la maqueta; no va en la app.

Accesibilidad incluida: `lang="es-AR"`, una sola región `main` con `h1`, etiquetas visibles, `autocomplete` (`username`, `current-password`), errores de campo con `aria-invalid` + `aria-describedby`, avisos con `role="alert"` (errores) y `role="status"` (sesión vencida), `aria-busy` en el botón cargando, foco visible con `--focus-ring` y alto mínimo `--hit-target` (44 px).

## Cómo verla

Los HTML usan rutas relativas a `design-system/`. Abrilos con doble clic o, si el navegador bloquea archivos locales, serví el repo desde la raíz:

```
python -m http.server 8765 --bind 127.0.0.1
```

y abrí `http://127.0.0.1:8765/openspec/changes/ui-login/mockups/login-vacio.html`. Los estilos de la maqueta están en [login.css](login.css) y usan solo variables de `design-system/tokens.css`.

# Tasks

## 1. Demo

- [ ] 1.1 Crear `TurnosDeEjemplo` (`@Profile("dev")`, después de `PacientesDeEjemplo`, usando `TurnoService.crear`); verificar con un test en perfil `test,dev` que crea pacientes y turnos ficticios sin solapamientos y que un segundo arranque no duplica nada

## 2. Seguridad

- [ ] 2.1 Escribir `scripts/verificar-entrega.ps1` (5 chequeos sobre `git ls-files`); verificar que sale en 0 sobre `main` y que falla si se agrega un `.env` o un `MAIL_ENABLED=true` de prueba (sin commitearlo)
- [ ] 2.2 Agregar `.mailmap`; verificar con `git shortlog -sne` que aparecen cuatro integrantes

## 3. README

- [ ] 3.1 Reescribir `README.md` como guía de punta a punta (D1) con todas las variables de `.env.example`, todos los tests, demo, checklist de seguridad, problemas frecuentes y mapa de la documentación; verificar que cada comando del README existe y que los enlaces locales resuelven

## 4. Verificación en máquina limpia

- [ ] 4.1 Clon nuevo en carpeta temporal: `npm ci` + `npm run verify`, `./mvnw test` y el script de seguridad; registrar resultados en `docs/entrega/verificacion-maquina-limpia.md`
- [ ] 4.2 Un integrante sigue el README en su máquina hasta `./mvnw verify` completo y la demo; registrar su resultado en el mismo documento

## 5. Cierre (requiere C-18 en `main`)

- [ ] 5.1 Actualizar README y demo con lo que aporte C-18, repetir `./mvnw verify`, `npm run verify` y el script de seguridad; verificar todo en verde

## Workflow follow-up

- Archivar el change (`openspec archive readme-y-demo`).
- Marcar `[x]` en C-20 de `CHANGES.md` en el mismo PR.
- Abrir PR `martin/C-20-readme-y-demo` → `main`.

## 1. Preparacion

- [ ] 1.1 Revisar skills y reglas de Governance ALTO.
- [ ] 1.2 Acordar contrato API con C-18.
- [ ] 1.3 Validar y aprobar los artefactos OpenSpec.

## 2. Persistencia

- [x] 2.1 Crear V6__notificaciones.sql.
- [x] 2.2 Crear entidad, estados y repositorio.
- [x] 2.3 Verificar restricciones y unicidad.

## 3. Transporte

- [x] 3.1 Crear puerto EnviadorEmail.
- [x] 3.2 Implementar adaptador SMTP y MAIL_*.
- [x] 3.3 Implementar doble en memoria para tests.
- [x] 3.4 Crear plantilla de contenido minimo.

## 4. Procesamiento

- [x] 4.1 Seleccionar candidatos segun Clock y configuracion.
- [x] 4.2 Revalidar estado, horario y consentimiento.
- [x] 4.3 Registrar envios y reintentos sin duplicados.
- [x] 4.4 Incorporar scheduler cada 15 minutos.
- [x] 4.5 Reiniciar marca al confirmar TurnoReprogramado.

## 5. API

- [x] 5.1 Crear DTO y endpoint autenticado.
- [ ] 5.2 Verificar compatibilidad con C-18.

## 6. Pruebas

- [x] 6.1 Ventana, configuracion y estados del turno.
- [x] 6.2 Email y consentimiento.
- [x] 6.3 Fallos, reintentos, limite y duplicados.
- [x] 6.4 Cancelacion entre consulta y envio.
- [x] 6.5 Reprogramacion y rollback.
- [x] 6.6 Privacidad y transporte deshabilitado.
- [x] 6.7 API autenticada, 401 y 404.
- [x] 6.8 Ejecutar Maven verify completo.

## 7. Cierre

- [x] 7.1 Registrar evidencia de pruebas.
- [x] 7.2 Revisar cambios y actualizar desde main.
- [x] 7.3 Validar y archivar OpenSpec.
- [x] 7.4 Actualizar CHANGES.md.
- [ ] 7.5 Commit, push y PR para revision del lider.
## 1. Nombre duplicado de una prestación inactiva

- [x] 1.1 Agregar `altaConNombreDePrestacionDesactivada` en `backend/src/test/java/ar/edu/turnosodonto/prestaciones/PrestacionIT.java`: crear "Limpieza Inactiva Ficticia" con `crear(...)`, desactivarla con `patchActiva(id, false)` y enviar `POST` con el mismo nombre exacto "Limpieza Inactiva Ficticia" (sin espacios ni cambio de capitalización, para aislar solo el estado inactivo); verificar estado 409 y `$.codigo` igual a `NOMBRE_DUPLICADO` ejecutando ese método contra `turnos_test`.

## 2. Recorte de espacios en la edición

- [x] 2.1 Agregar `edicionConNombreConEspacios` en `PrestacionIT`: crear "Control Ficticio", enviar `PUT /api/prestaciones/{id}` con nombre `"  Control Editado Ficticio  "` y duración 30; verificar estado 200, `$.nombre` igual a `"Control Editado Ficticio"` y que un `GET /api/prestaciones/{id}` posterior devuelve el mismo nombre recortado, ejecutando ese método contra `turnos_test`.

## 3. Consulta por id sin autenticación

- [x] 3.1 Agregar `sinTokenAlObtener` en `PrestacionIT`: crear una prestación con `crear("Sin Token Ficticia", 30)` y usar su `id` devuelto (registrado en `idsCreados`, sin depender del seed); ejecutar `mvc.perform(get(URL + "/" + id))` sin header `Authorization`; verificar estado 401 y `$.codigo` igual a `NO_AUTENTICADO`, siguiendo el patrón de `sinTokenAlListar`, ejecutando ese método contra `turnos_test`.

## 4. Verificación integral y límites del change

- [x] 4.1 Correr `./mvnw verify` completo y confirmar que pasan los tres tests nuevos junto con los existentes de `PrestacionIT`, con la base local `turnos_test` y sin SMTP real; verificar que el comando termina en verde.
- [x] 4.2 Revisar `git diff --name-only` y confirmar que el único archivo de código modificado es `PrestacionIT.java`, que `backend/src/main` y `V3__prestaciones.sql` quedan intactos y que los nuevos registros se limpian por id desde `idsCreados` sin borrar el seed.

# Spec Delta

## REMOVED Requirements

### Requirement: Página de inicio provisoria
**Reason**: El requisito decía que duraba "hasta que exista la agenda (C-16)". Con este change la ruta `/` muestra la agenda.
**Migration**: El comportamiento de `/` con sesión iniciada pasa a la capability `web-agenda` (requisito "Agenda en la ruta de inicio"). Los tests que buscaban el título "Inicio" pasan a buscar el título "Agenda".

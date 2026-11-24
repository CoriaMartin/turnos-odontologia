// Nombre visible del producto (definido 2026-11-23). Para cambiarlo, reemplazar solo esta constante.
const BRAND_NAME = "Agenda de Odontología";

document.querySelectorAll("[data-brand-name]").forEach((el) => {
  el.textContent = BRAND_NAME;
});
if (document.title.includes("{brand}")) {
  document.title = document.title.replace("{brand}", BRAND_NAME);
}

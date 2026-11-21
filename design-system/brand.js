// Nombre visible del producto. (TBD): reemplazar solo esta constante.
const BRAND_NAME = "Agenda Odonto (TBD)";

document.querySelectorAll("[data-brand-name]").forEach((el) => {
  el.textContent = BRAND_NAME;
});
if (document.title.includes("{brand}")) {
  document.title = document.title.replace("{brand}", BRAND_NAME);
}

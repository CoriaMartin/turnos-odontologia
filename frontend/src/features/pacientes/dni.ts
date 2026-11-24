/** Quita todo lo que no es número: el DNI se envía como dígitos y el backend lo valida. */
export function soloDigitos(valor: string): string {
  return valor.replace(/\D/g, '');
}

/** 12345678 → 12.345.678; con menos de 7 dígitos lo deja como está. */
export function formatearDni(valor: string): string {
  const digitos = soloDigitos(valor);
  if (digitos.length < 7) return digitos;
  const parteEntera = digitos.slice(0, digitos.length - 6);
  const miles = digitos.slice(-6, -3);
  const cientos = digitos.slice(-3);
  return `${parteEntera}.${miles}.${cientos}`;
}

// Regras de calendário do pacto. Funções puras, cobertas por testes.

export const DURACAO = 30;

/** Data local no formato AAAA-MM-DD (não usa UTC, para não virar o dia à noite). */
export function dataLocal(d: Date = new Date()): string {
  const a = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${a}-${m}-${dia}`;
}

function paraDiaAbsoluto(iso: string): number {
  const [a, m, d] = iso.split('-').map(Number);
  return Math.round(Date.UTC(a, m - 1, d) / 86_400_000);
}

/** Dia do pacto (1 a 30) para uma data. Fora do intervalo devolve 0 ou 31+. */
export function diaDoPacto(inicio: string, hoje: string): number {
  return paraDiaAbsoluto(hoje) - paraDiaAbsoluto(inicio) + 1;
}

export function pactoTerminou(inicio: string, hoje: string): boolean {
  return diaDoPacto(inicio, hoje) > DURACAO;
}

/** Data (AAAA-MM-DD) de um dia n do pacto. */
export function dataDoDia(inicio: string, n: number): string {
  const [a, m, d] = inicio.split('-').map(Number);
  return dataLocal(new Date(a, m - 1, d + n - 1));
}

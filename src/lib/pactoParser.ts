// O mentor encerra a negociação com um bloco <pacto>{...}</pacto>.
// Aqui ele é extraído e validado antes de ir para o ritual.

export type CamposPacto = {
  compromisso: string;
  criterio: string;
  contingencia: string;
  motivo: string;
};

const BLOCO = /<pacto>([\s\S]*?)<\/pacto>/;

export function extrairPacto(texto: string): { visivel: string; pacto: CamposPacto | null } {
  const achado = texto.match(BLOCO);
  const visivel = texto.replace(BLOCO, '').trim();
  if (!achado) return { visivel, pacto: null };
  try {
    const bruto = JSON.parse(achado[1]);
    const campos: (keyof CamposPacto)[] = ['compromisso', 'criterio', 'contingencia', 'motivo'];
    for (const c of campos) {
      if (typeof bruto[c] !== 'string' || bruto[c].trim().length === 0) return { visivel, pacto: null };
    }
    return {
      visivel,
      pacto: {
        compromisso: bruto.compromisso.trim(),
        criterio: bruto.criterio.trim(),
        contingencia: bruto.contingencia.trim(),
        motivo: bruto.motivo.trim(),
      },
    };
  } catch {
    return { visivel, pacto: null };
  }
}

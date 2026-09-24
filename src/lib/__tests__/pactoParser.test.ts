import { extrairPacto } from '../pactoParser';

describe('extrairPacto', () => {
  it('extrai um pacto completo e limpa o texto visível', () => {
    const t = 'Fechado.\n<pacto>{"compromisso":"Ler 5 páginas","criterio":"5 páginas lidas até 22h","contingencia":"Se chegar cansado, leio 1 página","motivo":"Quero voltar a confiar em mim"}</pacto>';
    const r = extrairPacto(t);
    expect(r.visivel).toBe('Fechado.');
    expect(r.pacto?.compromisso).toBe('Ler 5 páginas');
  });
  it('recusa pacto com campo vazio', () => {
    const t = '<pacto>{"compromisso":"x","criterio":"","contingencia":"y","motivo":"z"}</pacto>';
    expect(extrairPacto(t).pacto).toBeNull();
  });
  it('recusa JSON quebrado', () => {
    expect(extrairPacto('<pacto>{nada</pacto>').pacto).toBeNull();
  });
  it('texto sem pacto passa intacto', () => {
    expect(extrairPacto('Me conta mais.')).toEqual({ visivel: 'Me conta mais.', pacto: null });
  });
});

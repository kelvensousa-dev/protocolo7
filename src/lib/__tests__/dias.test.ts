import { dataDoDia, diaDoPacto, pactoTerminou } from '../dias';

describe('calendário do pacto', () => {
  it('o dia do selo é o dia 1', () => {
    expect(diaDoPacto('2026-09-24', '2026-09-24')).toBe(1);
  });
  it('atravessa a virada de mês', () => {
    expect(diaDoPacto('2026-09-24', '2026-10-01')).toBe(8);
  });
  it('o dia 30 ainda está dentro; o 31 já terminou', () => {
    expect(pactoTerminou('2026-09-24', dataDoDia('2026-09-24', 30))).toBe(false);
    expect(pactoTerminou('2026-09-24', dataDoDia('2026-09-24', 31))).toBe(true);
  });
  it('calcula a data do dia 30', () => {
    expect(dataDoDia('2026-09-24', 30)).toBe('2026-10-23');
  });
});

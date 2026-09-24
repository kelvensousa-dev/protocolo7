import { Platform, StyleSheet } from 'react-native';

// Paleta: tinta de assinatura sobre papel frio. O vinho do selo aparece
// só no momento de selar o pacto — é o único ponto de ênfase do app.
export const cor = {
  papel: '#EEF0EC',
  tinta: '#1F2A44',
  grafite: '#4E5566',
  linha: '#C9CDD3',
  selo: '#7E2A36',
  musgo: '#4F6B4C',
  branco: '#FFFFFF',
};

// Serifa para as palavras do pacto (o texto que a pessoa assinou);
// fonte do sistema para todo o resto.
export const serifa = Platform.select({ ios: 'Georgia', android: 'serif', default: 'serif' });

export const esp = { xs: 4, s: 8, m: 16, l: 24, xl: 40 };

export const txt = StyleSheet.create({
  titulo: { fontSize: 28, lineHeight: 34, fontWeight: '700', color: cor.tinta },
  corpo: { fontSize: 17, lineHeight: 25, color: cor.grafite },
  pacto: { fontFamily: serifa, fontSize: 30, lineHeight: 40, color: cor.tinta },
  campo: { fontFamily: serifa, fontSize: 19, lineHeight: 28, color: cor.tinta },
  rotulo: { fontSize: 15, color: cor.grafite, marginBottom: 4 },
  erro: { fontSize: 15, color: cor.selo },
  link: { fontSize: 16, color: cor.tinta, textDecorationLine: 'underline' },
});

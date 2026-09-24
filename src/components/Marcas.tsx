import { StyleSheet, Text, View } from 'react-native';
import { cor, esp } from '../theme';
import { Checkin } from '../lib/dados';
import { DURACAO, dataDoDia } from '../lib/dias';

// Trinta marcas, como traços num caderno. Não existe contador de sequência:
// um dia falhado não "zera" nada e não aparece em vermelho.
export function Marcas({ inicio, checkins, hoje }: { inicio: string; checkins: Checkin[]; hoje: number }) {
  const porData = new Map(checkins.map((c) => [c.dia, c]));
  const cumpridos = checkins.filter((c) => c.cumpriu).length;

  return (
    <View>
      <View style={s.grade} accessibilityLabel={`${cumpridos} dias cumpridos de ${DURACAO}`}>
        {Array.from({ length: DURACAO }, (_, i) => {
          const n = i + 1;
          const c = porData.get(dataDoDia(inicio, n));
          return (
            <View
              key={n}
              style={[
                s.marca,
                c?.cumpriu && s.cumprido,
                c && !c.cumpriu && s.naoCumprido,
                n === hoje && s.hoje,
                n > hoje && s.futuro,
              ]}
            />
          );
        })}
      </View>
      <Text style={s.legenda}>
        {cumpridos} {cumpridos === 1 ? 'dia cumprido' : 'dias cumpridos'}
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  grade: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, maxWidth: 10 * 22 + 9 * 10 },
  marca: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, borderColor: cor.grafite },
  cumprido: { backgroundColor: cor.tinta, borderColor: cor.tinta },
  naoCumprido: { borderStyle: 'dashed' },
  hoje: { borderWidth: 3, borderColor: cor.tinta },
  futuro: { borderColor: cor.linha },
  legenda: { marginTop: esp.s, color: cor.grafite, fontSize: 15 },
});

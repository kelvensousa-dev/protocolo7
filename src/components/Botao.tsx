import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { cor, esp } from '../theme';

type Props = {
  titulo: string;
  onPress: () => void;
  tipo?: 'primario' | 'secundario' | 'selo';
  desativado?: boolean;
  carregando?: boolean;
};

export function Botao({ titulo, onPress, tipo = 'primario', desativado, carregando }: Props) {
  const inativo = desativado || carregando;
  const fundo = tipo === 'primario' ? cor.tinta : tipo === 'selo' ? cor.selo : 'transparent';
  const texto = tipo === 'secundario' ? cor.tinta : cor.branco;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: !!inativo }}
      onPress={onPress}
      disabled={inativo}
      style={({ pressed }) => [
        s.base,
        { backgroundColor: fundo, opacity: inativo ? 0.45 : pressed ? 0.8 : 1 },
        tipo === 'secundario' && s.contorno,
      ]}
    >
      {carregando ? <ActivityIndicator color={texto} /> : <Text style={[s.texto, { color: texto }]}>{titulo}</Text>}
    </Pressable>
  );
}

const s = StyleSheet.create({
  base: { minHeight: 52, borderRadius: 6, paddingHorizontal: esp.l, alignItems: 'center', justifyContent: 'center' },
  contorno: { borderWidth: 1.5, borderColor: cor.tinta },
  texto: { fontSize: 17, fontWeight: '600' },
});

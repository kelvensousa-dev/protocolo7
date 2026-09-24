import { ReactNode } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { cor, esp } from '../theme';

export function Tela({ children }: { children: ReactNode }) {
  return (
    <SafeAreaView style={s.area}>
      <ScrollView contentContainerStyle={s.conteudo} keyboardShouldPersistTaps="handled">
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  area: { flex: 1, backgroundColor: cor.papel },
  conteudo: { padding: esp.l, gap: esp.l, paddingBottom: esp.xl * 2 },
});

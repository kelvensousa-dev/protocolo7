import { useState } from 'react';
import { Alert, Linking, Share, StyleSheet, Text, View } from 'react-native';
import { excluirConta, exportarTudo } from '../src/lib/dados';
import { supabase } from '../src/lib/supabase';
import { cancelarLembretes } from '../src/lib/lembrete';
import { Botao } from '../src/components/Botao';
import { Tela } from '../src/components/Tela';
import { cor, esp, txt } from '../src/theme';

export default function Dados() {
  const [erro, setErro] = useState<string | null>(null);
  const [ocupado, setOcupado] = useState(false);

  const exportar = async () => {
    setErro(null);
    try {
      await Share.share({ message: await exportarTudo() });
    } catch (e: any) {
      setErro(e.message);
    }
  };

  const excluir = () =>
    Alert.alert('Excluir conta', 'Apaga para sempre seus pactos, check-ins, conversas e gravações.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir tudo',
        style: 'destructive',
        onPress: async () => {
          setOcupado(true);
          try {
            await cancelarLembretes();
            await excluirConta();
          } catch (e: any) {
            setErro(e.message);
            setOcupado(false);
          }
        },
      },
    ]);

  return (
    <Tela>
      <Text style={[txt.titulo, { marginTop: esp.l }]}>Meus dados</Text>
      <Botao titulo="Exportar tudo (JSON)" tipo="secundario" onPress={exportar} />
      <Botao titulo="Sair" tipo="secundario" onPress={() => supabase.auth.signOut()} />
      <Botao titulo="Excluir conta e dados" tipo="selo" onPress={excluir} carregando={ocupado} />
      {erro && <Text style={txt.erro}>{erro}</Text>}

      <View style={s.ajuda}>
        <Text style={txt.corpo}>
          Se você estiver passando por um sofrimento forte, fale com alguém agora. O CVV atende 24 horas, de graça,
          pelo telefone 188.
        </Text>
        <Text style={txt.link} onPress={() => Linking.openURL('tel:188')}>
          Ligar para o CVV (188)
        </Text>
      </View>
    </Tela>
  );
}

const s = StyleSheet.create({
  ajuda: { gap: esp.s, borderTopWidth: 1, borderColor: cor.linha, paddingTop: esp.l, marginTop: esp.l },
});

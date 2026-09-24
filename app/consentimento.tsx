import { useState } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { salvarConsentimento } from '../src/lib/dados';
import { Botao } from '../src/components/Botao';
import { Tela } from '../src/components/Tela';
import { cor, esp, txt } from '../src/theme';

export default function Consentimento() {
  const router = useRouter();
  const [dados, setDados] = useState(false);
  const [voz, setVoz] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  const continuar = async () => {
    setSalvando(true);
    try {
      await salvarConsentimento(voz);
      router.replace('/');
    } catch (e: any) {
      setErro(e.message);
      setSalvando(false);
    }
  };

  return (
    <Tela>
      <Text style={txt.titulo}>Antes de começar</Text>
      <Text style={txt.corpo}>
        O que você escreve aqui pode envolver fé, saúde e dinheiro. Pela LGPD, esses dados precisam da sua permissão
        específica. Você pode exportar ou apagar tudo quando quiser, na tela Meus dados.
      </Text>

      <View style={s.linha}>
        <View style={s.textoLinha}>
          <Text style={s.tituloLinha}>Guardar meus pactos e check-ins</Text>
          <Text style={txt.rotulo}>
            Necessário para o app funcionar. As conversas são enviadas à IA do mentor para gerar as respostas.
          </Text>
        </View>
        <Switch value={dados} onValueChange={setDados} trackColor={{ true: cor.tinta }} />
      </View>

      <View style={s.linha}>
        <View style={s.textoLinha}>
          <Text style={s.tituloLinha}>Gravar minha voz na declaração</Text>
          <Text style={txt.rotulo}>Opcional. Sem isso, a declaração fica escrita.</Text>
        </View>
        <Switch value={voz} onValueChange={setVoz} trackColor={{ true: cor.tinta }} />
      </View>

      {erro && <Text style={txt.erro}>{erro}</Text>}
      <Botao titulo="Continuar" onPress={continuar} desativado={!dados} carregando={salvando} />
    </Tela>
  );
}

const s = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: esp.m, borderTopWidth: 1, borderColor: cor.linha, paddingTop: esp.m },
  textoLinha: { flex: 1 },
  tituloLinha: { fontSize: 17, fontWeight: '600', color: cor.tinta, marginBottom: 4 },
});

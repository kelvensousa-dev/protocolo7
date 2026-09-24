import { useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { conversarPacto, Mensagem } from '../../src/lib/mentor';
import { CamposPacto, extrairPacto } from '../../src/lib/pactoParser';
import { Botao } from '../../src/components/Botao';
import { cor, esp, txt } from '../../src/theme';

const ABERTURA =
  'Antes de falar do que você quer, quero entender o que já aconteceu. O que você já prometeu a si mesmo e não conseguiu cumprir?';

export default function Conversa() {
  const router = useRouter();
  const rolagem = useRef<ScrollView>(null);
  const [mensagens, setMensagens] = useState<Mensagem[]>([{ papel: 'assistant', conteudo: ABERTURA }]);
  const [texto, setTexto] = useState('');
  const [esperando, setEsperando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [pacto, setPacto] = useState<CamposPacto | null>(null);

  const enviar = async () => {
    const conteudo = texto.trim();
    if (!conteudo) return;
    const historico: Mensagem[] = [...mensagens, { papel: 'user', conteudo }];
    setMensagens(historico);
    setTexto('');
    setEsperando(true);
    setErro(null);
    try {
      const bruto = await conversarPacto(historico);
      const { visivel, pacto: proposto } = extrairPacto(bruto);
      // O histórico guarda o texto bruto, para o mentor saber que já propôs o pacto.
      setMensagens([...historico, { papel: 'assistant', conteudo: bruto }]);
      if (proposto) setPacto(proposto);
      if (!visivel && !proposto) setErro('Resposta vazia do mentor. Tente de novo.');
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setEsperando(false);
      setTimeout(() => rolagem.current?.scrollToEnd({ animated: true }), 50);
    }
  };

  return (
    <SafeAreaView style={s.area}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView ref={rolagem} contentContainerStyle={s.lista}>
          {mensagens.map((m, i) => {
            const conteudo = m.papel === 'assistant' ? extrairPacto(m.conteudo).visivel : m.conteudo;
            if (!conteudo) return null;
            return (
              <Text key={i} style={m.papel === 'assistant' ? s.mentor : s.usuario}>
                {conteudo}
              </Text>
            );
          })}
          {esperando && <Text style={s.digitando}>O mentor está escrevendo…</Text>}

          {pacto && (
            <View style={s.proposta}>
              <Text style={txt.titulo}>O pacto ficou assim</Text>
              <Text style={txt.rotulo}>Compromisso</Text>
              <Text style={txt.campo}>{pacto.compromisso}</Text>
              <Text style={txt.rotulo}>Vale como cumprido</Text>
              <Text style={txt.campo}>{pacto.criterio}</Text>
              <Text style={txt.rotulo}>Se algo der errado</Text>
              <Text style={txt.campo}>{pacto.contingencia}</Text>
              <Text style={txt.rotulo}>Por quê</Text>
              <Text style={txt.campo}>{pacto.motivo}</Text>
              <Botao titulo="Seguir para o ritual" onPress={() => router.push({ pathname: '/pacto/ritual', params: pacto })} />
              <Text style={txt.corpo}>Quer mudar algo? Escreva abaixo e o mentor ajusta.</Text>
            </View>
          )}
          {erro && <Text style={txt.erro}>{erro}</Text>}
        </ScrollView>

        <View style={s.barra}>
          <TextInput
            style={s.entrada}
            value={texto}
            onChangeText={setTexto}
            placeholder="Escreva sua resposta"
            multiline
            editable={!esperando}
          />
          <Botao titulo="Enviar" onPress={enviar} desativado={!texto.trim() || esperando} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  area: { flex: 1, backgroundColor: cor.papel },
  lista: { padding: esp.l, gap: esp.m },
  mentor: { fontSize: 17, lineHeight: 25, color: cor.tinta, maxWidth: '92%' },
  usuario: { fontSize: 17, lineHeight: 25, color: cor.tinta, backgroundColor: cor.branco, padding: esp.m, borderRadius: 6, alignSelf: 'flex-end', maxWidth: '85%' },
  digitando: { color: cor.grafite, fontStyle: 'italic' },
  proposta: { gap: esp.s, borderWidth: 1.5, borderColor: cor.tinta, borderRadius: 6, padding: esp.l, backgroundColor: cor.branco },
  barra: { flexDirection: 'row', alignItems: 'flex-end', gap: esp.s, padding: esp.m, borderTopWidth: 1, borderColor: cor.linha },
  entrada: { flex: 1, maxHeight: 120, fontSize: 17, color: cor.tinta, paddingVertical: esp.s },
});

import { useCallback, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { buscarPerfil, Checkin, checkinsDoPacto, concluirPacto, Pacto, pactoAtivo, registrarCheckin } from '../src/lib/dados';
import { dataLocal, diaDoPacto, DURACAO, pactoTerminou } from '../src/lib/dias';
import { responderCheckin } from '../src/lib/mentor';
import { cancelarLembretes } from '../src/lib/lembrete';
import { Botao } from '../src/components/Botao';
import { Marcas } from '../src/components/Marcas';
import { Tela } from '../src/components/Tela';
import { cor, esp, txt } from '../src/theme';

export default function Hoje() {
  const router = useRouter();
  const [carregando, setCarregando] = useState(true);
  const [pacto, setPacto] = useState<Pacto | null>(null);
  const [checkins, setCheckins] = useState<Checkin[]>([]);
  const [nota, setNota] = useState('');
  const [resposta, setResposta] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setErro(null);
    try {
      const perfil = await buscarPerfil();
      if (!perfil?.consentimento_dados_em) return router.replace('/consentimento');

      const ativo = await pactoAtivo();
      if (ativo && pactoTerminou(ativo.inicio, dataLocal())) {
        await concluirPacto(ativo.id);
        await cancelarLembretes();
        return router.replace({ pathname: '/fim', params: { id: ativo.id } });
      }
      setPacto(ativo);
      setCheckins(ativo ? await checkinsDoPacto(ativo.id) : []);
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setCarregando(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { carregar(); }, [carregar]));

  const fazerCheckin = async (cumpriu: boolean) => {
    if (!pacto) return;
    setEnviando(true);
    setErro(null);
    try {
      await registrarCheckin(pacto.id, cumpriu, nota);
      setCheckins(await checkinsDoPacto(pacto.id));
      setNota('');
      if (!cumpriu) router.push('/lembrar');
      setResposta(await responderCheckin(cumpriu, nota));
    } catch (e: any) {
      setErro(e.message);
    } finally {
      setEnviando(false);
    }
  };

  if (carregando) {
    return (
      <View style={s.centro}>
        <ActivityIndicator color={cor.tinta} />
      </View>
    );
  }

  const rodape = (
    <Text style={[txt.link, { marginTop: esp.l }]} onPress={() => router.push('/dados')}>
      Meus dados
    </Text>
  );

  if (!pacto) {
    return (
      <Tela>
        <Text style={[txt.pacto, { marginTop: esp.xl }]}>Você não precisa prometer muito. Precisa cumprir.</Text>
        <Text style={txt.corpo}>
          O mentor vai começar pelo que já aconteceu nas outras tentativas. Depois vocês fecham juntos um compromisso
          pequeno, que você cumpriria até no seu pior dia, por 30 dias.
        </Text>
        {erro && <Text style={txt.erro}>{erro}</Text>}
        <Botao titulo="Fazer meu pacto" onPress={() => router.push('/pacto/conversa')} />
        {rodape}
      </Tela>
    );
  }

  const hoje = diaDoPacto(pacto.inicio, dataLocal());
  const jaFezHoje = checkins.some((c) => c.dia === dataLocal());

  return (
    <Tela>
      <Text style={s.dia}>Dia {hoje} de {DURACAO}</Text>
      <Text style={txt.pacto}>{pacto.compromisso}</Text>
      <View>
        <Text style={txt.rotulo}>Vale como cumprido</Text>
        <Text style={txt.campo}>{pacto.criterio}</Text>
      </View>

      <Marcas inicio={pacto.inicio} checkins={checkins} hoje={hoje} />

      {!jaFezHoje ? (
        <View style={s.checkin}>
          <Text style={txt.titulo}>E hoje?</Text>
          <TextInput
            style={s.nota}
            placeholder="Uma linha sobre o dia (opcional)"
            value={nota}
            onChangeText={setNota}
            multiline
          />
          <Botao titulo="Cumpri hoje" onPress={() => fazerCheckin(true)} carregando={enviando} />
          <Botao titulo="Não cumpri hoje" tipo="secundario" onPress={() => fazerCheckin(false)} desativado={enviando} />
        </View>
      ) : (
        <View style={s.checkin}>
          <Text style={txt.corpo}>Check-in de hoje registrado. Amanhã tem outro.</Text>
          {enviando && <ActivityIndicator color={cor.tinta} />}
          {resposta && <Text style={s.resposta}>{resposta}</Text>}
        </View>
      )}

      {erro && <Text style={txt.erro}>{erro}</Text>}
      <Text style={txt.link} onPress={() => router.push('/lembrar')}>
        Ouvir o que eu disse no dia 1
      </Text>
      {rodape}
    </Tela>
  );
}

const s = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cor.papel },
  dia: { fontSize: 17, fontWeight: '600', color: cor.grafite, marginTop: esp.m },
  checkin: { gap: esp.m, borderTopWidth: 1, borderColor: cor.linha, paddingTop: esp.l },
  nota: { borderWidth: 1, borderColor: cor.linha, borderRadius: 6, padding: esp.m, fontSize: 16, minHeight: 60, backgroundColor: cor.branco, color: cor.tinta },
  resposta: { fontSize: 17, lineHeight: 25, color: cor.tinta, borderLeftWidth: 3, borderColor: cor.tinta, paddingLeft: esp.m },
});

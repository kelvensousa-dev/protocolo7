import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import { buscarPerfil, selarPacto } from '../../src/lib/dados';
import { CamposPacto } from '../../src/lib/pactoParser';
import { agendarLembreteDiario } from '../../src/lib/lembrete';
import { Botao } from '../../src/components/Botao';
import { Tela } from '../../src/components/Tela';
import { Tocador } from '../../src/components/Tocador';
import { cor, esp, txt } from '../../src/theme';

export default function Ritual() {
  const router = useRouter();
  const p = useLocalSearchParams<CamposPacto>();
  const campos: CamposPacto = {
    compromisso: String(p.compromisso ?? ''),
    criterio: String(p.criterio ?? ''),
    contingencia: String(p.contingencia ?? ''),
    motivo: String(p.motivo ?? ''),
  };

  const gravador = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const estado = useAudioRecorderState(gravador);
  const [podeGravar, setPodeGravar] = useState(false);
  const [audioUri, setAudioUri] = useState<string | null>(null);
  const [selando, setSelando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    buscarPerfil().then((perfil) => setPodeGravar(!!perfil?.consentimento_voz_em)).catch(() => setPodeGravar(false));
  }, []);

  const gravar = async () => {
    setErro(null);
    const permissao = await AudioModule.requestRecordingPermissionsAsync();
    if (!permissao.granted) return setErro('Sem acesso ao microfone. A declaração pode ficar só escrita.');
    await setAudioModeAsync({ playsInSilentMode: true, allowsRecording: true });
    await gravador.prepareToRecordAsync();
    gravador.record();
  };

  const parar = async () => {
    await gravador.stop();
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true });
    setAudioUri(gravador.uri);
  };

  const confirmarSelo = () =>
    Alert.alert(
      'Selar o pacto',
      'Depois de selado, o pacto não muda por 30 dias. Falhar um dia não quebra nada: o pacto é voltar no dia seguinte.',
      [
        { text: 'Ainda não', style: 'cancel' },
        { text: 'Selar', style: 'destructive', onPress: selar },
      ],
    );

  const selar = async () => {
    setSelando(true);
    setErro(null);
    try {
      await selarPacto(campos, audioUri);
      await agendarLembreteDiario(campos.criterio);
      router.replace('/');
    } catch (e: any) {
      setErro(e.message);
      setSelando(false);
    }
  };

  const gravando = estado.isRecording;
  const segundos = Math.floor((estado.durationMillis ?? 0) / 1000);

  return (
    <Tela>
      <Text style={txt.titulo}>O ritual</Text>

      <View style={s.etapa}>
        <Text style={s.numero}>1. Declare em voz alta</Text>
        <Text style={txt.corpo}>Leia com as suas palavras. É isso que você vai ouvir nos dias difíceis.</Text>
        <Text style={txt.pacto}>
          Pelos próximos 30 dias, eu vou {campos.compromisso.charAt(0).toLowerCase() + campos.compromisso.slice(1)}.
        </Text>
        <Text style={txt.campo}>Porque {campos.motivo.charAt(0).toLowerCase() + campos.motivo.slice(1)}</Text>

        {podeGravar ? (
          <View style={{ gap: esp.s }}>
            {!gravando && !audioUri && <Botao titulo="Gravar minha declaração" onPress={gravar} />}
            {gravando && <Botao titulo={`Parar gravação (${segundos}s)`} tipo="secundario" onPress={parar} />}
            {audioUri && !gravando && (
              <>
                <Tocador uri={audioUri} rotulo="Ouvir o que gravei" />
                <Text style={txt.link} onPress={() => { setAudioUri(null); gravar(); }}>
                  Gravar de novo
                </Text>
              </>
            )}
          </View>
        ) : (
          <Text style={txt.rotulo}>Gravação de voz desativada. A declaração fica escrita.</Text>
        )}
      </View>

      <View style={s.etapa}>
        <Text style={s.numero}>2. Vale como cumprido</Text>
        <Text style={txt.campo}>{campos.criterio}</Text>
        <Text style={txt.rotulo}>Só existe sim ou não. Sem meio-termo.</Text>
      </View>

      <View style={s.etapa}>
        <Text style={s.numero}>3. Quando der errado</Text>
        <Text style={txt.campo}>{campos.contingencia}</Text>
      </View>

      <View style={s.etapa}>
        <Text style={s.numero}>4. O selo</Text>
        <Text style={txt.corpo}>A partir daqui, o pacto não pode ser editado nem suavizado por 30 dias.</Text>
        {erro && <Text style={txt.erro}>{erro}</Text>}
        <Botao
          titulo="Selar o pacto"
          tipo="selo"
          onPress={confirmarSelo}
          carregando={selando}
          desativado={gravando || (podeGravar && !audioUri)}
        />
        {podeGravar && !audioUri && <Text style={txt.rotulo}>Grave a declaração para poder selar.</Text>}
        <Text style={txt.link} onPress={() => router.back()}>
          Voltar à conversa para ajustar
        </Text>
      </View>
    </Tela>
  );
}

const s = StyleSheet.create({
  etapa: { gap: esp.s, borderTopWidth: 1, borderColor: cor.linha, paddingTop: esp.l },
  numero: { fontSize: 17, fontWeight: '700', color: cor.tinta },
});

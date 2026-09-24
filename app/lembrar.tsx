import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Pacto, pactoAtivo, urlDoAudio } from '../src/lib/dados';
import { Botao } from '../src/components/Botao';
import { Tela } from '../src/components/Tela';
import { Tocador } from '../src/components/Tocador';
import { cor, esp, txt } from '../src/theme';

// Quando a pessoa falha ou pensa em desistir, o app não manda frase motivacional:
// devolve a voz dela mesma, do dia em que selou o pacto.
export default function Lembrar() {
  const router = useRouter();
  const [pacto, setPacto] = useState<Pacto | null>(null);
  const [url, setUrl] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const p = await pactoAtivo();
        setPacto(p);
        if (p?.audio_path) setUrl(await urlDoAudio(p.audio_path));
      } catch (e: any) {
        setErro(e.message);
      } finally {
        setCarregando(false);
      }
    })();
  }, []);

  if (carregando) return <View style={s.centro}><ActivityIndicator color={cor.tinta} /></View>;

  return (
    <Tela>
      <Text style={[txt.titulo, { marginTop: esp.l }]}>Você disse isso no dia 1.</Text>
      {url ? <Tocador uri={url} /> : null}
      {pacto && (
        <>
          <Text style={txt.pacto}>{pacto.compromisso}</Text>
          <Text style={txt.campo}>Porque {pacto.motivo.charAt(0).toLowerCase() + pacto.motivo.slice(1)}</Text>
          <View style={s.plano}>
            <Text style={txt.rotulo}>O seu plano para este momento</Text>
            <Text style={txt.campo}>{pacto.contingencia}</Text>
          </View>
        </>
      )}
      <Text style={txt.corpo}>Um dia não quebra o pacto. O que conta é voltar amanhã.</Text>
      {erro && <Text style={txt.erro}>{erro}</Text>}
      <Botao titulo="Voltar para hoje" onPress={() => router.back()} />
    </Tela>
  );
}

const s = StyleSheet.create({
  centro: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cor.papel },
  plano: { borderLeftWidth: 3, borderColor: cor.tinta, paddingLeft: esp.m },
});

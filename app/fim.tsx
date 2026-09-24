import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { buscarPacto, checkinsDoPacto, Pacto } from '../src/lib/dados';
import { DURACAO } from '../src/lib/dias';
import { Botao } from '../src/components/Botao';
import { Tela } from '../src/components/Tela';
import { esp, txt } from '../src/theme';

export default function Fim() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [pacto, setPacto] = useState<Pacto | null>(null);
  const [cumpridos, setCumpridos] = useState<number | null>(null);

  useEffect(() => {
    if (!id) return;
    buscarPacto(id).then(setPacto);
    checkinsDoPacto(id).then((c) => setCumpridos(c.filter((x) => x.cumpriu).length));
  }, [id]);

  return (
    <Tela>
      <Text style={[txt.titulo, { marginTop: esp.xl }]}>O pacto chegou ao fim.</Text>
      {pacto && <Text style={txt.pacto}>{pacto.compromisso}</Text>}
      {cumpridos !== null && (
        <Text style={txt.corpo}>
          Você cumpriu {cumpridos} de {DURACAO} dias. Esse número é seu: ninguém prometeu por você e ninguém cumpriu
          por você.
        </Text>
      )}
      <Text style={txt.corpo}>
        Se quiser, faça um novo pacto. Ele pode ser o mesmo compromisso, um pouco maior, ou outra área da sua vida.
      </Text>
      <Botao titulo="Fazer um novo pacto" onPress={() => router.replace('/pacto/conversa')} />
      <Text style={txt.link} onPress={() => router.replace('/')}>
        Agora não
      </Text>
    </Tela>
  );
}

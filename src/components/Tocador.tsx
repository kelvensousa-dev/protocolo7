import { Pressable, StyleSheet, Text } from 'react-native';
import { useAudioPlayer, useAudioPlayerStatus } from 'expo-audio';
import { cor, esp } from '../theme';

export function Tocador({ uri, rotulo = 'Ouvir a declaração' }: { uri: string; rotulo?: string }) {
  const player = useAudioPlayer({ uri });
  const status = useAudioPlayerStatus(player);

  const alternar = () => {
    if (status.playing) {
      player.pause();
    } else {
      if (status.didJustFinish || (status.duration > 0 && status.currentTime >= status.duration)) player.seekTo(0);
      player.play();
    }
  };

  return (
    <Pressable accessibilityRole="button" onPress={alternar} style={s.botao}>
      <Text style={s.icone}>{status.playing ? '❚❚' : '▶'}</Text>
      <Text style={s.texto}>{status.playing ? 'Pausar' : rotulo}</Text>
    </Pressable>
  );
}

const s = StyleSheet.create({
  botao: { flexDirection: 'row', alignItems: 'center', gap: esp.m, paddingVertical: esp.m },
  icone: { width: 44, height: 44, borderRadius: 22, backgroundColor: cor.tinta, color: cor.branco, textAlign: 'center', lineHeight: 44, fontSize: 16, overflow: 'hidden' },
  texto: { fontSize: 17, color: cor.tinta, fontWeight: '600' },
});

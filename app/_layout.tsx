import { useEffect } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SessaoProvider, useSessao } from '../src/lib/sessao';
import { cor } from '../src/theme';

function Guardiao() {
  const { session, carregando } = useSessao();
  const segmentos = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (carregando) return;
    const naLogin = segmentos[0] === 'login';
    if (!session && !naLogin) router.replace('/login');
    if (session && naLogin) router.replace('/');
  }, [session, carregando, segmentos]);

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cor.papel } }} />
    </>
  );
}

export default function Layout() {
  return (
    <SessaoProvider>
      <Guardiao />
    </SessaoProvider>
  );
}

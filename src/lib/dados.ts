import { supabase } from './supabase';
import { CamposPacto } from './pactoParser';
import { dataLocal } from './dias';

export type Pacto = CamposPacto & {
  id: string;
  audio_path: string | null;
  inicio: string;
  fim: string;
  status: 'ativo' | 'concluido';
};

export type Checkin = { id: string; dia: string; cumpriu: boolean; nota: string | null };

async function usuarioId(): Promise<string> {
  const { data } = await supabase.auth.getUser();
  if (!data.user) throw new Error('Sessão expirada. Entre de novo.');
  return data.user.id;
}

export async function buscarPerfil() {
  const { data, error } = await supabase
    .from('profiles')
    .select('consentimento_dados_em, consentimento_voz_em')
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function salvarConsentimento(voz: boolean) {
  const agora = new Date().toISOString();
  const { error } = await supabase
    .from('profiles')
    .update({ consentimento_dados_em: agora, consentimento_voz_em: voz ? agora : null })
    .eq('id', await usuarioId());
  if (error) throw error;
}

export async function pactoAtivo(): Promise<Pacto | null> {
  const { data, error } = await supabase.from('pactos').select('*').eq('status', 'ativo').maybeSingle();
  if (error) throw error;
  return data as Pacto | null;
}

export async function buscarPacto(id: string): Promise<Pacto | null> {
  const { data, error } = await supabase.from('pactos').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data as Pacto | null;
}

export async function checkinsDoPacto(pactoId: string): Promise<Checkin[]> {
  const { data, error } = await supabase
    .from('checkins')
    .select('id, dia, cumpriu, nota')
    .eq('pacto_id', pactoId)
    .order('dia');
  if (error) throw error;
  return data ?? [];
}

export async function registrarCheckin(pactoId: string, cumpriu: boolean, nota: string) {
  const { error } = await supabase.from('checkins').insert({
    pacto_id: pactoId,
    user_id: await usuarioId(),
    dia: dataLocal(),
    cumpriu,
    nota: nota.trim() || null,
  });
  if (error) throw error;
}

/** Grava a declaração (se houver), cria o pacto já selado e devolve o id. */
export async function selarPacto(campos: CamposPacto, audioUri: string | null): Promise<string> {
  const uid = await usuarioId();
  let audio_path: string | null = null;

  if (audioUri) {
    const arquivo = await fetch(audioUri);
    const bytes = await arquivo.arrayBuffer();
    audio_path = `${uid}/${Date.now()}.m4a`;
    const { error } = await supabase.storage
      .from('declaracoes')
      .upload(audio_path, bytes, { contentType: 'audio/mp4' });
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from('pactos')
    .insert({ ...campos, user_id: uid, audio_path, inicio: dataLocal() })
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function concluirPacto(id: string) {
  const { error } = await supabase.from('pactos').update({ status: 'concluido' }).eq('id', id);
  if (error) throw error;
}

export async function urlDoAudio(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('declaracoes').createSignedUrl(path, 600);
  if (error) throw error;
  return data.signedUrl;
}

export async function exportarTudo(): Promise<string> {
  const [perfil, pactos, checkins, mensagens] = await Promise.all([
    supabase.from('profiles').select('*'),
    supabase.from('pactos').select('*'),
    supabase.from('checkins').select('*'),
    supabase.from('mensagens').select('*'),
  ]);
  return JSON.stringify(
    { exportado_em: new Date().toISOString(), perfil: perfil.data, pactos: pactos.data, checkins: checkins.data, mensagens: mensagens.data },
    null,
    2,
  );
}

export async function excluirConta() {
  const { error } = await supabase.functions.invoke('excluir-conta', { body: {} });
  if (error) throw error;
  await supabase.auth.signOut();
}

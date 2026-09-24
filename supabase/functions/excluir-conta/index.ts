// Exclui a conta e TODOS os dados da pessoa (LGPD).
// Usa a service role, que existe só no servidor.
import { createClient } from 'jsr:@supabase/supabase-js@2';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const url = Deno.env.get('SUPABASE_URL')!;
  const usuario = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data } = await usuario.auth.getUser();
  if (!data.user) return new Response('não autenticado', { status: 401, headers: cors });

  const admin = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const uid = data.user.id;

  // 1. Gravações de voz
  const { data: arquivos } = await admin.storage.from('declaracoes').list(uid, { limit: 1000 });
  if (arquivos?.length) {
    await admin.storage.from('declaracoes').remove(arquivos.map((a) => `${uid}/${a.name}`));
  }
  // 2. Usuário — perfis, pactos, check-ins e mensagens caem juntos (on delete cascade)
  const { error } = await admin.auth.admin.deleteUser(uid);
  if (error) return new Response(error.message, { status: 500, headers: cors });

  return new Response(JSON.stringify({ ok: true }), { headers: { ...cors, 'Content-Type': 'application/json' } });
});

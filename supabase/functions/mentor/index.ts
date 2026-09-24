// Edge Function "mentor": a única parte do sistema que conversa com a API do Claude.
// A chave fica em ANTHROPIC_API_KEY (supabase secrets set) e nunca vai para o app.
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { BASE, ETAPA_CHECKIN, ETAPA_PACTO } from './prompt.ts';

const MODELO = Deno.env.get('MENTOR_MODEL') ?? 'claude-sonnet-5';
const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

type Msg = { role: 'user' | 'assistant'; content: string };

function responder(corpo: unknown, status = 200) {
  return new Response(JSON.stringify(corpo), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

function dataLocalHoje(): string {
  // Brasília (UTC-3). Ajuste se houver usuários em outros fusos.
  return new Date(Date.now() - 3 * 3600_000).toISOString().slice(0, 10);
}

async function chamarClaude(system: string, messages: Msg[]): Promise<string> {
  const r = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-api-key': Deno.env.get('ANTHROPIC_API_KEY')!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({ model: MODELO, max_tokens: 800, system, messages }),
  });
  if (!r.ok) throw new Error(`API do Claude: ${r.status} ${await r.text()}`);
  const data = await r.json();
  return (data.content ?? [])
    .filter((b: { type: string }) => b.type === 'text')
    .map((b: { text: string }) => b.text)
    .join('\n')
    .trim();
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });

  const supa = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_ANON_KEY')!, {
    global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } },
  });
  const { data: auth } = await supa.auth.getUser();
  if (!auth.user) return responder({ erro: 'não autenticado' }, 401);
  const uid = auth.user.id;

  try {
    const corpo = await req.json();

    if (corpo.etapa === 'pacto') {
      // Limpa e limita o histórico; a API exige que a conversa comece pelo usuário.
      let msgs: Msg[] = (Array.isArray(corpo.mensagens) ? corpo.mensagens : [])
        .filter((m: any) => (m.papel === 'user' || m.papel === 'assistant') && typeof m.conteudo === 'string' && m.conteudo.trim())
        .slice(-40)
        .map((m: any) => ({ role: m.papel, content: m.conteudo.slice(0, 4000) }));
      if (msgs.length === 0 || msgs[msgs.length - 1].role !== 'user') return responder({ erro: 'mensagem vazia' }, 400);
      if (msgs[0].role === 'assistant') msgs = [{ role: 'user', content: 'Quero começar um pacto.' }, ...msgs];

      const texto = await chamarClaude(`${BASE}\n\n${ETAPA_PACTO}`, msgs);
      await supa.from('mensagens').insert([
        { user_id: uid, etapa: 'pacto', papel: 'user', conteudo: msgs[msgs.length - 1].content },
        { user_id: uid, etapa: 'pacto', papel: 'assistant', conteudo: texto },
      ]);
      return responder({ texto });
    }

    if (corpo.etapa === 'checkin') {
      // O contexto vem do banco, não do app: o mentor sempre vê o pacto real.
      const { data: pacto } = await supa.from('pactos').select('*').eq('status', 'ativo').maybeSingle();
      if (!pacto) return responder({ erro: 'sem pacto ativo' }, 400);
      const { data: ultimos } = await supa
        .from('checkins')
        .select('dia, cumpriu, nota')
        .eq('pacto_id', pacto.id)
        .order('dia', { ascending: false })
        .limit(7);

      const hoje = dataLocalHoje();
      const dia = Math.round((Date.parse(hoje) - Date.parse(pacto.inicio)) / 86_400_000) + 1;
      const historico = (ultimos ?? [])
        .map((c) => `${c.dia}: ${c.cumpriu ? 'cumpriu' : 'não cumpriu'}${c.nota ? ` — "${c.nota}"` : ''}`)
        .join('\n');

      const contexto = `PACTO SELADO
Compromisso: ${pacto.compromisso}
Vale como cumprido: ${pacto.criterio}
Plano de contingência: ${pacto.contingencia}
Motivo: ${pacto.motivo}

ÚLTIMOS CHECK-INS (mais recente primeiro)
${historico || 'nenhum'}`;

      const nota = typeof corpo.nota === 'string' ? corpo.nota.trim().slice(0, 1000) : '';
      const pergunta = `Check-in de hoje (dia ${dia} de 30): ${corpo.cumpriu ? 'cumpri' : 'não cumpri'}.${nota ? ` Nota: ${nota}` : ''}`;

      const texto = await chamarClaude(`${BASE}\n\n${ETAPA_CHECKIN}\n\n${contexto}`, [{ role: 'user', content: pergunta }]);
      await supa.from('mensagens').insert([
        { user_id: uid, etapa: 'checkin', papel: 'user', conteudo: pergunta },
        { user_id: uid, etapa: 'checkin', papel: 'assistant', conteudo: texto },
      ]);
      return responder({ texto });
    }

    return responder({ erro: 'etapa desconhecida' }, 400);
  } catch (e) {
    console.error(e);
    return responder({ erro: 'falha no mentor' }, 500);
  }
});

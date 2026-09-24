import { supabase } from './supabase';

export type Mensagem = { papel: 'user' | 'assistant'; conteudo: string };

/** Conversa de negociação do pacto. O histórico vai inteiro a cada chamada. */
export async function conversarPacto(mensagens: Mensagem[]): Promise<string> {
  const { data, error } = await supabase.functions.invoke('mentor', {
    body: { etapa: 'pacto', mensagens },
  });
  if (error) throw new Error('O mentor não respondeu. Confira a conexão e tente de novo.');
  return data.texto as string;
}

/** Resposta curta ao check-in. O backend busca o pacto e os últimos dias sozinho. */
export async function responderCheckin(cumpriu: boolean, nota: string): Promise<string> {
  const { data, error } = await supabase.functions.invoke('mentor', {
    body: { etapa: 'checkin', cumpriu, nota },
  });
  if (error) throw new Error('O check-in foi salvo, mas o mentor não respondeu agora.');
  return data.texto as string;
}

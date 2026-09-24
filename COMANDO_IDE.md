# Comando para a IA de programação (Google Antigravity ou similar)

Cole o texto abaixo na IDE, com esta pasta aberta.

---

PAPEL
Você é um engenheiro de software sênior e vai continuar comigo o app "Protocolo 7". Explique cada decisão de forma simples. Antes de escrever código novo, apresente o plano e espere minha aprovação. Trabalhe em fases e pare ao fim de cada uma para eu testar.

O QUE É O PRODUTO
Um mentor com IA para quem já tentou mudar várias vezes, falhou e não confia mais na própria palavra. O app não busca sucesso no primeiro ciclo: busca prova. A pessoa faz um compromisso pequeno, que cumpriria até no pior dia, e o sustenta por 30 dias. Primeiro a confiança, depois a direção. Leia docs/produto-versao-fechada.md e docs/dados-retencao-e-compromisso.md antes de tudo.

O QUE JÁ EXISTE (fase 1, nesta pasta)
Expo + TypeScript + expo-router no app; Supabase (Postgres com RLS, Auth, Storage, Edge Functions) no backend; mentor na API do Claude, chamado só pela Edge Function "mentor". Telas: login, consentimento, Hoje, conversa do pacto, ritual, lembrar, fim, dados. O pacto é imutável por 30 dias por trigger no banco. Leia o README e rode os testes antes de mudar qualquer coisa.

REGRAS QUE NÃO PODEM SER QUEBRADAS
- A chave da API do Claude nunca fica no app.
- Row Level Security em toda tabela nova.
- O pacto selado não muda. Nenhuma tela pode editar, suavizar ou cancelar um pacto ativo.
- Sem contador de sequência, sem vermelho para falha, sem gamificação, sem notificação genérica. No máximo 1 lembrete por dia.
- Nada que meça sucesso por tempo de uso. A métrica do produto é: percentual de pessoas que sustentam o compromisso aos 30 dias (referência: 64% sustentam 30 dias sozinhas; apps da categoria retêm 3 a 4%).
- Protocolo de crise: sinais de risco à vida pausam tudo e mostram o CVV (188). O app não faz diagnóstico.
- Dados de fé, saúde e finanças seguem a LGPD: consentimento específico, exportar e excluir.

FASE 2 — POLIR O CICLO 1
- Escolha do horário do lembrete e horário de silêncio.
- Transcrição da declaração gravada (proponha serviços com custo), para ela aparecer escrita junto do áudio.
- Histórico do pacto: os 30 dias com as notas de cada check-in.
- Tela de encerramento com resumo gerado pelo mentor e a comparação com os números do diagnóstico inicial.
- Painel interno (só para mim) com a métrica do produto: % de pactos com 30 dias sustentados, e taxa de check-in por dia do ciclo.
Critério de aceite: eu uso o app por 30 dias sem precisar mexer no banco manualmente.

FASE 3 — CICLO 2: QUEM ATRAVESSOU AJUDA QUEM ESTÁ COMEÇANDO
- Quem concluiu um pacto pode se oferecer como mentor por 3 meses. Depois sai da função (pode voltar a ser iniciante ou mentor em outro momento).
- Pareamento feito pelo sistema, por cicatriz parecida (o tipo de falha e a fase da vida), nunca por escolha em catálogo. Sem perfil público, sem foto de vitrine, sem seguidores, sem ranking.
- O mentor humano entra só depois que o iniciante já selou o próprio pacto. Nunca no dia 1.
- Formato estreito: uma pergunta do iniciante por semana; o mentor responde contando o que ele fez, nunca prescrevendo. Oriente isso na interface.
- O mentor não carrega o resultado do outro; isso aparece escrito no momento em que ele aceita.
- Moderação: denúncia, bloqueio, filtro de conteúdo e o mesmo protocolo de crise nas mensagens entre pessoas.
- Testemunho: quem concluiu pode, com permissão explícita, deixar o áudio do dia 1 e do dia 30 para iniciantes ouvirem de forma anônima.

Em cada fase: escreva testes das regras principais, rode o app, atualize o README e pare para minha revisão.

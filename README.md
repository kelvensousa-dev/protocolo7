# Protocolo 7 — protótipo do ciclo 1 (pacto de 30 dias)

App em React Native (Expo + TypeScript) com backend no Supabase e o mentor rodando na API do Claude.
Este protótipo cobre só o ciclo 1 da versão fechada do produto: a pessoa faz **um** pacto pequeno e o sustenta por 30 dias.

## O que já funciona

- Conta com e-mail e senha, e consentimento LGPD separado para dados e para voz.
- Conversa com o mentor que começa pelo passado (o que já falhou), negocia a meta para baixo e fecha o pacto.
- Ritual em 4 momentos: declaração gravada na própria voz, critério de sim ou não, plano de contingência e selo.
- Pacto imutável por 30 dias. Quem garante isso é o banco (trigger), não o app.
- Check-in diário de sim ou não, com resposta curta do mentor, que vê o pacto e os últimos 7 dias.
- Ao marcar "não cumpri", o app toca a voz da própria pessoa do dia 1 e mostra o plano de contingência dela.
- Um único lembrete por dia, às 21h, com o critério da própria pessoa.
- Tela de encerramento no dia 31, exportação de todos os dados e exclusão da conta.

## O que ainda não existe

Ciclo 2 (mentores humanos), transcrição da declaração, relatórios e escolha do horário do lembrete.
O arquivo `COMANDO_IDE.md` descreve essas fases para você continuar com a IA de programação.

## Como rodar (primeira vez)

1. Instale o Node.js 20 ou mais novo e o app **Expo Go** no celular.
2. Crie um projeto grátis em https://supabase.com.
3. Na pasta do projeto:
   ```
   npm install
   npx expo install --fix
   ```
   O segundo comando alinha as versões das bibliotecas com a versão do Expo instalada.
   O arquivo `.npmrc` já vem configurado para aceitar as dependências opcionais do Expo;
   sem ele, o `npm install` para num conflito de versão do `react-dom`, que o app nem usa.
4. Instale a CLI do Supabase (https://supabase.com/docs/guides/cli) e conecte:
   ```
   npx supabase login
   npx supabase link --project-ref SEU_PROJECT_REF
   npx supabase db push
   npx supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   npx supabase functions deploy mentor
   npx supabase functions deploy excluir-conta
   ```
   A chave da API do Claude se cria em https://console.anthropic.com e só existe no Supabase.
5. Copie `.env.example` para `.env` e preencha a URL e a chave `anon` (Supabase → Project Settings → API).
6. Para testar sem confirmar e-mail: Supabase → Authentication → Providers → Email → desligue "Confirm email".
7. Rode `npx expo start` e leia o QR code com o celular.

## Testes

`npm test` roda as regras principais: calendário dos 30 dias e leitura do bloco do pacto que o mentor devolve
(8 testes, todos passando). `npx tsc --noEmit` confere os tipos do app; as funções em `supabase/functions/`
rodam em Deno no servidor e ficam fora dessa checagem.

## Custos

A API do Claude cobra por uso (cada mensagem do mentor é uma chamada). O Supabase tem plano gratuito com limites.
Comece com você como único usuário. O modelo pode ser trocado pela variável `MENTOR_MODEL` no Supabase;
confira os modelos disponíveis em https://docs.claude.com/en/api/overview.

## Onde está cada coisa

- `app/` — as telas (Hoje, conversa, ritual, lembrar, fim, dados, login, consentimento)
- `src/lib/` — dados, regras dos 30 dias, mentor, lembrete
- `supabase/migrations/` — tabelas, segurança (RLS) e as travas do pacto
- `supabase/functions/mentor/prompt.ts` — o comando do mentor, versionado
- `docs/` — a versão fechada do produto e os dados de retenção que a sustentam

## Trocar o nome

"Protocolo 7" é nome provisório. Quando o nome definitivo estiver escolhido e conferido no INPI
(busca.inpi.gov.br, Marcas, classes 9 e 41), troque nestes lugares:

- `app.json` — `name` (o que aparece embaixo do ícone), `slug`, `scheme` e a frase do microfone
- `package.json` — `name`, só letras minúsculas e sem espaço
- `supabase/functions/mentor/prompt.ts` — a primeira frase do comando, porque o mentor diz o nome do app para a pessoa
- `README.md`, `COMANDO_IDE.md` e `docs/`

Depois de trocar o `prompt.ts`, publique a função de novo com `npx supabase functions deploy mentor`.

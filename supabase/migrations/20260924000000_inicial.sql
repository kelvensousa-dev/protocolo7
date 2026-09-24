-- Protocolo 7 — ciclo 1 (pacto de 30 dias)
-- Regras que o banco garante sozinho, independentemente do app:
--   * cada pessoa só vê e altera os próprios dados (Row Level Security);
--   * um pacto nasce selado e não pode ser editado depois;
--   * só existe um pacto ativo por pessoa;
--   * check-in é um por dia, dentro dos 30 dias, e não pode ser reescrito.

create table public.profiles (
  id uuid primary key references auth.users on delete cascade,
  consentimento_dados_em timestamptz,
  consentimento_voz_em timestamptz,
  created_at timestamptz not null default now()
);

create function public.criar_perfil() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id) values (new.id);
  return new;
end $$;

create trigger ao_criar_usuario after insert on auth.users
  for each row execute function public.criar_perfil();

create table public.pactos (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  compromisso text not null check (length(trim(compromisso)) > 0),
  criterio text not null check (length(trim(criterio)) > 0),
  contingencia text not null check (length(trim(contingencia)) > 0),
  motivo text not null check (length(trim(motivo)) > 0),
  audio_path text,
  selado_em timestamptz not null default now(),
  inicio date not null,
  fim date not null,
  status text not null default 'ativo' check (status in ('ativo', 'concluido')),
  created_at timestamptz not null default now()
);

create unique index um_pacto_ativo on public.pactos (user_id) where status = 'ativo';

-- No nascimento: o servidor define selo, fim e status (o app não escolhe).
create function public.nascer_pacto() returns trigger language plpgsql as $$
begin
  if new.inicio < current_date - 1 or new.inicio > current_date + 1 then
    raise exception 'Data de início inválida';
  end if;
  new.selado_em := now();
  new.fim := new.inicio + 29;
  new.status := 'ativo';
  return new;
end $$;

create trigger antes_de_inserir_pacto before insert on public.pactos
  for each row execute function public.nascer_pacto();

-- Depois de selado: só o status pode mudar, e só de ativo para concluído.
create function public.proteger_pacto() returns trigger language plpgsql as $$
begin
  if new.compromisso is distinct from old.compromisso
     or new.criterio is distinct from old.criterio
     or new.contingencia is distinct from old.contingencia
     or new.motivo is distinct from old.motivo
     or new.audio_path is distinct from old.audio_path
     or new.selado_em is distinct from old.selado_em
     or new.inicio is distinct from old.inicio
     or new.fim is distinct from old.fim
     or new.user_id is distinct from old.user_id then
    raise exception 'Um pacto selado não pode ser alterado';
  end if;
  if old.status <> 'ativo' then
    raise exception 'Este pacto já foi encerrado';
  end if;
  return new;
end $$;

create trigger antes_de_alterar_pacto before update on public.pactos
  for each row execute function public.proteger_pacto();

create table public.checkins (
  id uuid primary key default gen_random_uuid(),
  pacto_id uuid not null references public.pactos on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  dia date not null,
  cumpriu boolean not null,
  nota text,
  created_at timestamptz not null default now(),
  unique (pacto_id, dia)
);

create function public.validar_checkin() returns trigger language plpgsql as $$
declare p record;
begin
  select user_id, inicio, fim, status into p from public.pactos where id = new.pacto_id;
  if not found or p.user_id <> new.user_id then
    raise exception 'Pacto não encontrado';
  end if;
  if p.status <> 'ativo' then
    raise exception 'Este pacto já foi encerrado';
  end if;
  if new.dia < p.inicio or new.dia > p.fim then
    raise exception 'Dia fora dos 30 dias do pacto';
  end if;
  if new.dia > current_date + 1 then
    raise exception 'Não dá para registrar um dia que ainda não chegou';
  end if;
  return new;
end $$;

create trigger antes_de_inserir_checkin before insert on public.checkins
  for each row execute function public.validar_checkin();

create table public.mensagens (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users on delete cascade,
  etapa text not null check (etapa in ('pacto', 'checkin')),
  papel text not null check (papel in ('user', 'assistant')),
  conteudo text not null,
  created_at timestamptz not null default now()
);

-- Row Level Security em todas as tabelas
alter table public.profiles enable row level security;
alter table public.pactos enable row level security;
alter table public.checkins enable row level security;
alter table public.mensagens enable row level security;

create policy "perfil: ler o próprio" on public.profiles for select using (auth.uid() = id);
create policy "perfil: alterar o próprio" on public.profiles for update using (auth.uid() = id);

create policy "pactos: ler os próprios" on public.pactos for select using (auth.uid() = user_id);
create policy "pactos: criar os próprios" on public.pactos for insert with check (auth.uid() = user_id);
create policy "pactos: encerrar os próprios" on public.pactos for update using (auth.uid() = user_id);

-- Check-ins e mensagens: sem política de update. Registro é registro.
create policy "checkins: ler os próprios" on public.checkins for select using (auth.uid() = user_id);
create policy "checkins: criar os próprios" on public.checkins for insert with check (auth.uid() = user_id);

create policy "mensagens: ler as próprias" on public.mensagens for select using (auth.uid() = user_id);
create policy "mensagens: criar as próprias" on public.mensagens for insert with check (auth.uid() = user_id);

-- Gravações da declaração: bucket privado, uma pasta por usuário
insert into storage.buckets (id, name, public) values ('declaracoes', 'declaracoes', false)
  on conflict (id) do nothing;

create policy "declaracoes: ler as próprias" on storage.objects for select
  using (bucket_id = 'declaracoes' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "declaracoes: enviar as próprias" on storage.objects for insert
  with check (bucket_id = 'declaracoes' and (storage.foldername(name))[1] = auth.uid()::text);

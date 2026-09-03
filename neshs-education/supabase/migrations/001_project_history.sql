create table if not exists public.project_folders (
  id uuid primary key default gen_random_uuid(),
  parent_id uuid references public.project_folders(id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.project_files (
  id uuid primary key default gen_random_uuid(),
  folder_id uuid not null references public.project_folders(id) on delete cascade,
  name text not null,
  url text not null,
  mime_type text,
  size_bytes bigint,
  created_at timestamptz not null default now()
);

create index if not exists project_folders_parent_id_idx on public.project_folders(parent_id);
create index if not exists project_files_folder_id_idx on public.project_files(folder_id);

alter table public.project_folders enable row level security;
alter table public.project_files enable row level security;

drop policy if exists "public read/write project folders" on public.project_folders;
create policy "public read/write project folders" on public.project_folders for all using (true) with check (true);
drop policy if exists "public read/write project files" on public.project_files;
create policy "public read/write project files" on public.project_files for all using (true) with check (true);
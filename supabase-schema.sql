-- Kanban Board Database Schema

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Boards table
create table if not exists public.boards (
    id uuid default uuid_generate_v4() primary key,
    title text not null,
    user_id uuid not null references auth.users(id) on delete cascade,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Columns table
create table if not exists public.columns (
    id uuid default uuid_generate_v4() primary key,
    board_id uuid not null references public.boards(id) on delete cascade,
    title text not null,
    position integer not null,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tasks table
create table if not exists public.tasks (
    id uuid default uuid_generate_v4() primary key,
    column_id uuid not null references public.columns(id) on delete cascade,
    title text not null,
    description text,
    position integer not null,
    priority text check (priority in ('low', 'medium', 'high')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.boards enable row level security;
alter table public.columns enable row level security;
alter table public.tasks enable row level security;

-- Boards policies
create policy "Users can view their own boards"
    on public.boards for select
    using (auth.uid() = user_id);

create policy "Users can create their own boards"
    on public.boards for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own boards"
    on public.boards for update
    using (auth.uid() = user_id);

create policy "Users can delete their own boards"
    on public.boards for delete
    using (auth.uid() = user_id);

-- Columns policies
create policy "Users can view columns of their boards"
    on public.columns for select
    using (
        exists (
            select 1 from public.boards
            where boards.id = columns.board_id
            and boards.user_id = auth.uid()
        )
    );

create policy "Users can create columns in their boards"
    on public.columns for insert
    with check (
        exists (
            select 1 from public.boards
            where boards.id = columns.board_id
            and boards.user_id = auth.uid()
        )
    );

create policy "Users can update columns in their boards"
    on public.columns for update
    using (
        exists (
            select 1 from public.boards
            where boards.id = columns.board_id
            and boards.user_id = auth.uid()
        )
    );

create policy "Users can delete columns in their boards"
    on public.columns for delete
    using (
        exists (
            select 1 from public.boards
            where boards.id = columns.board_id
            and boards.user_id = auth.uid()
        )
    );

-- Tasks policies
create policy "Users can view tasks in their boards"
    on public.tasks for select
    using (
        exists (
            select 1 from public.columns
            join public.boards on boards.id = columns.board_id
            where columns.id = tasks.column_id
            and boards.user_id = auth.uid()
        )
    );

create policy "Users can create tasks in their boards"
    on public.tasks for insert
    with check (
        exists (
            select 1 from public.columns
            join public.boards on boards.id = columns.board_id
            where columns.id = tasks.column_id
            and boards.user_id = auth.uid()
        )
    );

create policy "Users can update tasks in their boards"
    on public.tasks for update
    using (
        exists (
            select 1 from public.columns
            join public.boards on boards.id = columns.board_id
            where columns.id = tasks.column_id
            and boards.user_id = auth.uid()
        )
    );

create policy "Users can delete tasks in their boards"
    on public.tasks for delete
    using (
        exists (
            select 1 from public.columns
            join public.boards on boards.id = columns.board_id
            where columns.id = tasks.column_id
            and boards.user_id = auth.uid()
        )
    );

-- Create indexes for better performance
create index if not exists boards_user_id_idx on public.boards(user_id);
create index if not exists columns_board_id_idx on public.columns(board_id);
create index if not exists tasks_column_id_idx on public.tasks(column_id);

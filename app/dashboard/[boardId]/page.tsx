import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/board/kanban-board";
import { Column, Task } from "@/types";

interface BoardPageProps {
    params: Promise<{
        boardId: string;
    }>;
}

export default async function BoardPage(props: BoardPageProps) {
    const params = await props.params;
    const supabase = await createClient();
    const { boardId } = params;

    // Fetch board details
    const { data: board } = await supabase
        .from("boards")
        .select("*")
        .eq("id", boardId)
        .single();

    if (!board) {
        notFound();
    }

    // Fetch columns
    const { data: columnsData } = await supabase
        .from("columns")
        .select("*")
        .eq("board_id", boardId)
        .order("position");

    // Fetch tasks
    const { data: tasksData } = await supabase
        .from("tasks")
        .select("*")
        .in("column_id", columnsData?.map((col) => col.id) || [])
        .order("position");

    const columns = (columnsData as Column[]) || [];
    const tasks = (tasksData as Task[]) || [];

    return (
        <div className="flex h-full flex-col space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold tracking-tight">{board.title}</h2>
            </div>
            <div className="flex-1 overflow-x-auto pb-4">
                <KanbanBoard initialColumns={columns} initialTasks={tasks} boardId={boardId} />
            </div>
        </div>
    );
}

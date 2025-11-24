"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
} from "@dnd-kit/core";
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import { createClient } from "@/lib/supabase/client";
import { Column, Task } from "@/types";
import { BoardColumn } from "./column";
import { TaskCard } from "./task-card";
import { CreateTaskDialog } from "./create-task-dialog";

interface KanbanBoardProps {
    initialColumns: Column[];
    initialTasks: Task[];
    boardId: string;
}

export function KanbanBoard({ initialColumns, initialTasks, boardId }: KanbanBoardProps) {
    const [columns, setColumns] = useState<Column[]>(initialColumns);
    const [tasks, setTasks] = useState<Task[]>(initialTasks);
    const [activeColumn, setActiveColumn] = useState<Column | null>(null);
    const [activeTask, setActiveTask] = useState<Task | null>(null);
    const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
    const [selectedColumnId, setSelectedColumnId] = useState<string | null>(null);

    const router = useRouter();
    const supabase = createClient();

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 3, // 3px movement required to start drag
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const columnsId = useMemo(() => columns.map((col) => col.id), [columns]);

    function onDragStart(event: DragStartEvent) {
        if (event.active.data.current?.type === "Column") {
            setActiveColumn(event.active.data.current.column);
            return;
        }

        if (event.active.data.current?.type === "Task") {
            setActiveTask(event.active.data.current.task);
            return;
        }
    }

    function onDragEnd(event: DragEndEvent) {
        setActiveColumn(null);
        setActiveTask(null);

        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveColumn = active.data.current?.type === "Column";
        if (isActiveColumn) {
            setColumns((columns) => {
                const activeIndex = columns.findIndex((col) => col.id === activeId);
                const overIndex = columns.findIndex((col) => col.id === overId);
                return arrayMove(columns, activeIndex, overIndex);
                // TODO: Save column order to DB
            });
        }

        const isActiveTask = active.data.current?.type === "Task";
        if (isActiveTask) {
            saveTaskOrder();
        }
    }

    function onDragOver(event: DragOverEvent) {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id;
        const overId = over.id;

        if (activeId === overId) return;

        const isActiveTask = active.data.current?.type === "Task";
        const isOverTask = over.data.current?.type === "Task";

        if (!isActiveTask) return;

        // Dropping a Task over another Task
        if (isActiveTask && isOverTask) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                const overIndex = tasks.findIndex((t) => t.id === overId);

                if (tasks[activeIndex].column_id !== tasks[overIndex].column_id) {
                    tasks[activeIndex].column_id = tasks[overIndex].column_id;
                }

                return arrayMove(tasks, activeIndex, overIndex);
            });
        }

        const isOverColumn = over.data.current?.type === "Column";

        // Dropping a Task over a Column
        if (isActiveTask && isOverColumn) {
            setTasks((tasks) => {
                const activeIndex = tasks.findIndex((t) => t.id === activeId);
                tasks[activeIndex].column_id = String(overId);
                return arrayMove(tasks, activeIndex, activeIndex); // No reorder, just column change
            });
        }
    }

    async function saveTaskOrder() {
        const updates = tasks.map((task, index) => ({
            id: task.id,
            position: index,
            column_id: task.column_id
        }));

        const { error } = await supabase.from('tasks').upsert(updates);
        if (error) console.error('Error saving order:', error);
    }

    const handleAddTask = (columnId: string) => {
        setSelectedColumnId(columnId);
        setIsTaskDialogOpen(true);
    };

    const handleTaskCreated = () => {
        window.location.reload();
    };

    return (
        <div className="m-auto flex h-full w-full items-center overflow-x-auto overflow-y-hidden px-[40px]">
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={onDragStart}
                onDragEnd={onDragEnd}
                onDragOver={onDragOver}
            >
                <div className="flex gap-4">
                    <SortableContext items={columnsId}>
                        {columns.map((col) => (
                            <BoardColumn
                                key={col.id}
                                column={col}
                                tasks={tasks.filter((task) => task.column_id === col.id)}
                                onAddTask={handleAddTask}
                            />
                        ))}
                    </SortableContext>
                </div>

                {typeof document !== 'undefined' && (
                    <DragOverlay>
                        {activeColumn && (
                            <BoardColumn
                                column={activeColumn}
                                tasks={tasks.filter((task) => task.column_id === activeColumn.id)}
                                onAddTask={handleAddTask}
                            />
                        )}
                        {activeTask && <TaskCard task={activeTask} />}
                    </DragOverlay>
                )}
            </DndContext>

            <CreateTaskDialog
                open={isTaskDialogOpen}
                onOpenChange={setIsTaskDialogOpen}
                columnId={selectedColumnId}
                onTaskCreated={handleTaskCreated}
            />
        </div>
    );
}

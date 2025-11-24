"use client";

import { useMemo } from "react";
import { SortableContext, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, GripVertical } from "lucide-react";
import { Column, Task } from "@/types";
import { TaskCard } from "./task-card";

interface BoardColumnProps {
    column: Column;
    tasks: Task[];
    onAddTask: (columnId: string) => void;
}

export function BoardColumn({ column, tasks, onAddTask }: BoardColumnProps) {
    const taskIds = useMemo(() => tasks.map((task) => task.id), [tasks]);

    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: column.id,
        data: {
            type: "Column",
            column,
        },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="w-[300px] h-[500px] rounded-lg border-2 border-primary border-dashed bg-primary/10 opacity-40"
            />
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="w-[300px] h-full max-h-full flex flex-col bg-secondary/20"
        >
            <CardHeader className="p-4 flex flex-row items-center justify-between space-y-0">
                <div className="flex items-center gap-2">
                    <button {...attributes} {...listeners} className="cursor-grab text-muted-foreground hover:text-foreground">
                        <GripVertical className="h-4 w-4" />
                    </button>
                    <CardTitle className="text-sm font-semibold">
                        {column.title}
                        <span className="ml-2 text-xs text-muted-foreground font-normal">
                            {tasks.length}
                        </span>
                    </CardTitle>
                </div>
            </CardHeader>
            <CardContent className="p-2 flex-1 flex flex-col gap-2 overflow-y-auto min-h-[100px]">
                <SortableContext items={taskIds}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} />
                    ))}
                </SortableContext>
            </CardContent>
            <div className="p-2 pt-0">
                <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground hover:text-foreground"
                    onClick={() => onAddTask(column.id)}
                >
                    <Plus className="mr-2 h-4 w-4" />
                    タスクを追加
                </Button>
            </div>
        </Card>
    );
}

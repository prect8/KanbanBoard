"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Task } from "@/types";
import { GripVertical } from "lucide-react";

interface TaskCardProps {
    task: Task;
}

export function TaskCard({ task }: TaskCardProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
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
                className="opacity-30 bg-primary/10 rounded-lg border-2 border-primary border-dashed h-[100px]"
            />
        );
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            className="cursor-grab active:cursor-grabbing hover:border-primary/50 transition-colors"
        >
            <CardHeader className="p-3 pb-0 flex flex-row items-start justify-between space-y-0">
                <span className="font-medium text-sm line-clamp-2">{task.title}</span>
                <button {...attributes} {...listeners} className="text-muted-foreground hover:text-foreground cursor-grab">
                    <GripVertical className="h-4 w-4" />
                </button>
            </CardHeader>
            <CardContent className="p-3 pt-2">
                <div className="flex items-center justify-between mt-2">
                    <Badge variant={getPriorityVariant(task.priority)} className="text-[10px] px-1 py-0 h-5">
                        {task.priority}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}

function getPriorityVariant(priority: string) {
    switch (priority) {
        case "high":
            return "destructive";
        case "medium":
            return "default"; // or secondary
        case "low":
            return "outline";
        default:
            return "secondary";
    }
}

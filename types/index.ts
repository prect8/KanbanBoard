export type Task = {
    id: string;
    column_id: string;
    title: string;
    description?: string;
    priority: 'low' | 'medium' | 'high';
    position: number;
};

export type Column = {
    id: string;
    board_id: string;
    title: string;
    position: number;
};

export type Board = {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
};

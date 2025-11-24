import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { CreateBoardDialog } from "@/components/dashboard/create-board-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default async function DashboardPage() {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { data: boards } = await supabase
        .from("boards")
        .select("*")
        .eq("user_id", user?.id)
        .order("created_at", { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <CreateBoardDialog />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {boards?.map((board) => (
                    <Link key={board.id} href={`/dashboard/${board.id}`}>
                        <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {board.title}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-xs text-muted-foreground">
                                    Created {formatDistanceToNow(new Date(board.created_at), { addSuffix: true })}
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}

                {boards?.length === 0 && (
                    <div className="col-span-full flex h-[450px] shrink-0 items-center justify-center rounded-md border border-dashed">
                        <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
                            <h3 className="mt-4 text-lg font-semibold">No boards created</h3>
                            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                                You haven&apos;t created any boards yet. Start by creating one.
                            </p>
                            <CreateBoardDialog />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

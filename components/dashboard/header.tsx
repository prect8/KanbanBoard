import Link from "next/link";
import { UserNav } from "@/components/dashboard/user-nav";
import { LayoutDashboard } from "lucide-react";

export function Header() {
    return (
        <header className="border-b">
            <div className="flex h-16 items-center px-4 md:px-6">
                <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
                    <LayoutDashboard className="h-6 w-6" />
                    <span>Kanban Board</span>
                </Link>
                <div className="ml-auto flex items-center space-x-4">
                    <UserNav />
                </div>
            </div>
        </header>
    );
}

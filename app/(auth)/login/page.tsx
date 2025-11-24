import { LoginForm } from "@/components/auth/login-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Login - Kanban Board",
    description: "Login to your account",
};

export const dynamic = 'force-dynamic';

export default function LoginPage() {
    return <LoginForm />;
}

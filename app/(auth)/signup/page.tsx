import { SignupForm } from "@/components/auth/signup-form";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Sign Up - Kanban Board",
    description: "Create a new account",
};

export const dynamic = 'force-dynamic';

export default function SignupPage() {
    return <SignupForm />;
}

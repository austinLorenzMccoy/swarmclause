"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { Wallet } from "lucide-react";

interface LoginFormProps {
    className?: string;
    variant?: "default" | "outline" | "ghost";
    size?: "default" | "sm" | "lg" | "icon";
}

export function LoginForm({
    className,
    variant = "default",
    size = "default",
}: LoginFormProps) {
    const { connectWallet, isConnecting } = useAuth();

    return (
        <Button
            className={className}
            variant={variant}
            size={size}
            onClick={connectWallet}
            disabled={isConnecting}
        >
            <Wallet className="mr-2 h-4 w-4" />
            {isConnecting ? "Connecting..." : "Connect Wallet"}
        </Button>
    );
}

"use client";

import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    useCallback,
    useRef,
} from "react";
import type { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

interface AuthContextValue {
    user: User | null;
    session: Session | null;
    walletAddress: string | null;
    loading: boolean;
    /** Connect by entering a Hedera account ID manually */
    connectManual: (accountId: string) => Promise<void>;
    /** Connect via HashPack / WalletConnect (opens pairing modal) */
    connectHashPack: () => Promise<void>;
    disconnectWallet: () => Promise<void>;
    isConnecting: boolean;
}

const AuthContext = createContext<AuthContextValue>({
    user: null,
    session: null,
    walletAddress: null,
    loading: true,
    connectManual: async () => { },
    connectHashPack: async () => { },
    disconnectWallet: async () => { },
    isConnecting: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [walletAddress, setWalletAddress] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [isConnecting, setIsConnecting] = useState(false);

    useEffect(() => {
        // Restore wallet from localStorage
        const saved =
            typeof window !== "undefined"
                ? localStorage.getItem("hedera_wallet")
                : null;
        if (saved) setWalletAddress(saved);

        // Get initial Supabase session
        supabase.auth.getSession().then(({ data: { session: s } }) => {
            setSession(s);
            setUser(s?.user ?? null);
            setLoading(false);
        });

        // Listen for auth changes
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, s) => {
            setSession(s);
            setUser(s?.user ?? null);
            setLoading(false);
        });

        return () => subscription.unsubscribe();
    }, []);

    /** Shared post-connect logic: Supabase anon auth + local state */
    const finalizeConnect = useCallback(async (accountId: string) => {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) console.error("Supabase anon sign-in error:", error.message);
        setWalletAddress(accountId);
        localStorage.setItem("hedera_wallet", accountId);
    }, []);

    /** Manual connect: user types their 0.0.XXXXX account ID */
    const connectManual = useCallback(
        async (accountId: string) => {
            if (!accountId || !accountId.match(/^\d+\.\d+\.\d+$/)) {
                throw new Error("Invalid Hedera account ID (expected 0.0.XXXXX)");
            }
            setIsConnecting(true);
            try {
                await finalizeConnect(accountId);
            } finally {
                setIsConnecting(false);
            }
        },
        [finalizeConnect]
    );

    /** HashPack connect via WalletConnect */
    const connectHashPack = useCallback(async () => {
        setIsConnecting(true);
        try {
            const { DAppConnector, HederaSessionEvent, HederaJsonRpcMethod } =
                await import("@hashgraph/hedera-wallet-connect");
            const { LedgerId } = await import("@hashgraph/sdk");

            const dAppConnector = new DAppConnector(
                {
                    name: "SwarmClause",
                    description: "Autonomous AI Treaty Negotiation",
                    url: typeof window !== "undefined" ? window.location.origin : "",
                    icons: [],
                },
                LedgerId.TESTNET,
                /* WalletConnect project ID – get one free at cloud.walletconnect.com */
                process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id",
                Object.values(HederaJsonRpcMethod),
                [HederaSessionEvent.ChainChanged, HederaSessionEvent.AccountsChanged]
            );

            await dAppConnector.init();
            await dAppConnector.openModal();

            const signers = dAppConnector.signers;
            if (signers && signers.length > 0) {
                const accountId = signers[0].getAccountId().toString();
                await finalizeConnect(accountId);
            } else {
                throw new Error("No account returned from HashPack");
            }
        } catch (err: any) {
            console.error("HashPack connect error:", err);
            // If WalletConnect fails (e.g. no project ID), surface a clear message
            if (err.message?.includes("project")) {
                throw new Error(
                    "WalletConnect project ID not configured. Use manual connect or set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID."
                );
            }
            throw err;
        } finally {
            setIsConnecting(false);
        }
    }, [finalizeConnect]);

    const disconnectWallet = useCallback(async () => {
        await supabase.auth.signOut();
        setWalletAddress(null);
        setUser(null);
        setSession(null);
        localStorage.removeItem("hedera_wallet");
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                session,
                walletAddress,
                loading,
                connectManual,
                connectHashPack,
                disconnectWallet,
                isConnecting,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

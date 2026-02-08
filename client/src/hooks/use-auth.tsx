import { createContext, useContext, ReactNode } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { User, InsertUser } from "@shared/schema";

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    loginMutation: any;
    registerMutation: any;
    logoutMutation: any;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: user, isLoading } = useQuery<User | null>({
        queryKey: ["/api/me"],
        queryFn: async () => {
            try {
                const res = await api.get("/me");
                return res.data;
            } catch (err) {
                return null;
            }
        },
        retry: false,
    });

    const loginMutation = useMutation({
        mutationFn: async (credentials: any) => {
            const res = await api.post("/login", credentials);
            localStorage.setItem("token", res.data.token);
            return res.data.user;
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/me"], user);
            toast({ title: "Welcome back!", description: `Logged in as ${user.username}` });
        },
        onError: (error: any) => {
            toast({
                title: "Login failed",
                description: error.response?.data?.message || "Invalid credentials",
                variant: "destructive",
            });
        },
    });

    const registerMutation = useMutation({
        mutationFn: async (userData: InsertUser) => {
            const res = await api.post("/register", userData);
            localStorage.setItem("token", res.data.token);
            return res.data.user;
        },
        onSuccess: (user: User) => {
            queryClient.setQueryData(["/api/me"], user);
            toast({ title: "Account created", description: "Welcome to TheBloodDonor!" });
        },
        onError: (error: any) => {
            toast({
                title: "Registration failed",
                description: error.response?.data?.message || "Something went wrong",
                variant: "destructive",
            });
        },
    });

    const logoutMutation = useMutation({
        mutationFn: async () => {
            localStorage.removeItem("token");
        },
        onSuccess: () => {
            queryClient.setQueryData(["/api/me"], null);
            toast({ title: "Logged out", description: "See you soon!" });
        },
    });

    return (
        <AuthContext.Provider value={{ user: user ?? null, isLoading, loginMutation, registerMutation, logoutMutation }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error("useAuth must be used within an AuthProvider");
    return context;
}

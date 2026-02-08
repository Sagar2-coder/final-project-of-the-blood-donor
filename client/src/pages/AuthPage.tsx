import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertUserSchema, InsertUser } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

export default function AuthPage() {
    const { user, loginMutation, registerMutation } = useAuth();
    const [, setLocation] = useLocation();

    if (user) {
        setLocation("/");
        return null;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0f0f23] p-4">
            <div className="absolute inset-0 bg-gradient-to-br from-[#e74c3c]/10 to-[#c0392b]/20 z-0" />

            <Card className="w-full max-w-md z-10 border-none shadow-2xl bg-white/95 backdrop-blur-md">
                <CardHeader className="text-center">
                    <div className="text-4xl mb-2">❤️</div>
                    <CardTitle className="text-3xl font-bold bg-gradient-to-r from-[#e74c3c] to-[#c0392b] bg-clip-text text-transparent">
                        TheBloodDonor
                    </CardTitle>
                    <CardDescription>Save lives, one drop at a time</CardDescription>
                </CardHeader>
                <CardContent>
                    <Tabs defaultValue="login" className="w-full">
                        <TabsList className="grid w-full grid-cols-2 mb-6">
                            <TabsTrigger value="login">Login</TabsTrigger>
                            <TabsTrigger value="register">Sign Up</TabsTrigger>
                        </TabsList>

                        <TabsContent value="login">
                            <LoginForm />
                        </TabsContent>

                        <TabsContent value="register">
                            <RegisterForm />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}

function LoginForm() {
    const { loginMutation } = useAuth();
    const form = useForm({
        defaultValues: { username: "", password: "" },
    });

    return (
        <form onSubmit={form.handleSubmit((data) => loginMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" {...form.register("username")} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" {...form.register("password")} required />
            </div>
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#e74c3c] to-[#c0392b] hover:scale-[1.02] transition-transform"
                disabled={loginMutation.isPending}
            >
                {loginMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Login"}
            </Button>
        </form>
    );
}

function RegisterForm() {
    const { registerMutation } = useAuth();
    const form = useForm<InsertUser>({
        defaultValues: { username: "", password: "", email: "" },
    });

    return (
        <form onSubmit={form.handleSubmit((data) => registerMutation.mutate(data))} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="reg-username">Username</Label>
                <Input id="reg-username" {...form.register("username")} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...form.register("email")} required />
            </div>
            <div className="space-y-2">
                <Label htmlFor="reg-password">Password</Label>
                <Input id="reg-password" type="password" {...form.register("password")} required />
            </div>
            <Button
                type="submit"
                className="w-full bg-gradient-to-r from-[#e74c3c] to-[#c0392b] hover:scale-[1.02] transition-transform"
                disabled={registerMutation.isPending}
            >
                {registerMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
            </Button>
        </form>
    );
}

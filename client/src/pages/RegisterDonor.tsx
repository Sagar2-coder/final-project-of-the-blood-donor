import { Navbar } from "@/components/Navbar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertDonorSchema, InsertDonor } from "@shared/schema";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, HeartPulse } from "lucide-react";

export default function RegisterDonor() {
    const { toast } = useToast();
    const [, setLocation] = useLocation();
    const queryClient = useQueryClient();

    const { data: existingProfile, isLoading: loadingProfile } = useQuery({
        queryKey: ["/api/donors/me"],
        queryFn: async () => {
            try {
                const res = await api.get("/donors/me");
                return res.data;
            } catch (err) {
                return null;
            }
        },
    });

    const form = useForm<InsertDonor>({
        resolver: zodResolver(insertDonorSchema),
        values: existingProfile || {
            name: "",
            address: "",
            city: "",
            bloodGroup: "",
            contactNumber: "",
            lastDonationDate: "",
            userType: "donor",
        },
    });

    const mutation = useMutation({
        mutationFn: async (data: InsertDonor) => {
            return await api.post("/donors", data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/donors"] });
            queryClient.invalidateQueries({ queryKey: ["/api/donors/me"] });
            toast({ title: "Success!", description: "Your donor profile has been saved." });
            setLocation("/donors");
        },
        onError: (error: any) => {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to save profile",
                variant: "destructive",
            });
        },
    });

    if (loadingProfile) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50">
            <Navbar />
            <main className="container mx-auto px-4 py-12">
                <div className="max-w-2xl mx-auto">
                    <Card className="border-none shadow-xl">
                        <CardHeader className="bg-gradient-to-r from-[#e74c3c] to-[#c0392b] text-white rounded-t-xl">
                            <div className="flex items-center gap-3">
                                <HeartPulse className="h-8 w-8" />
                                <div>
                                    <CardTitle className="text-2xl font-bold">Donor Profile</CardTitle>
                                    <CardDescription className="text-white/80">
                                        {existingProfile ? "Update your registration details" : "Register as a life-saving blood donor"}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-8">
                            <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Full Name</Label>
                                        <Input id="name" {...form.register("name")} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="bloodGroup">Blood Group</Label>
                                        <Select
                                            onValueChange={(v) => form.setValue("bloodGroup", v)}
                                            value={form.watch("bloodGroup")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select group" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"].map(bg => (
                                                    <SelectItem key={bg} value={bg}>{bg}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" {...form.register("city")} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="contactNumber">Contact Number</Label>
                                        <Input id="contactNumber" {...form.register("contactNumber")} placeholder="e.g. 9876543210" required />
                                    </div>

                                    <div className="space-y-2 md:col-span-2">
                                        <Label htmlFor="address">Full Address</Label>
                                        <Input id="address" {...form.register("address")} placeholder="Area, Street, Landmark" required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="lastDonationDate">Last Donation Date</Label>
                                        <Input id="lastDonationDate" type="date" {...form.register("lastDonationDate")} required />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="userType">Register As</Label>
                                        <Select
                                            onValueChange={(v) => form.setValue("userType", v as any)}
                                            value={form.watch("userType")}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="donor">Donor (Can give blood)</SelectItem>
                                                <SelectItem value="receiver">Receiver (Seeking blood)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <Button
                                    type="submit"
                                    className="w-full h-12 text-lg bg-[#e74c3c] hover:bg-[#c0392b] transition-all"
                                    disabled={mutation.isPending}
                                >
                                    {mutation.isPending ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Save Profile"}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

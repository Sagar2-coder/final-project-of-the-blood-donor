import { Navbar } from "@/components/Navbar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { Donor } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, CheckCircle, Trash2, ShieldAlert } from "lucide-react";

export default function AdminPanel() {
    const { toast } = useToast();
    const queryClient = useQueryClient();

    const { data: donors, isLoading } = useQuery<Donor[]>({
        queryKey: ["/api/donors", { isAdminView: true }],
        queryFn: async () => {
            const res = await api.get("/donors"); // In a real app, you might have a specific admin endpoint
            return res.data;
        },
    });

    const verifyMutation = useMutation({
        mutationFn: async (id: number) => {
            return await api.patch(`/donors/${id}/verify`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/donors"] });
            toast({ title: "Success", description: "Donor verified successfully." });
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            return await api.delete(`/donors/${id}`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["/api/donors"] });
            toast({ title: "Deleted", description: "Donor profile removed.", variant: "destructive" });
        },
    });

    if (isLoading) {
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
                <div className="flex items-center gap-3 mb-8">
                    <ShieldAlert className="h-8 w-8 text-[#e74c3c]" />
                    <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-border overflow-hidden">
                    <Table>
                        <TableHeader className="bg-gray-50">
                            <TableRow>
                                <TableHead>Donor</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Blood Group</TableHead>
                                <TableHead>Verification</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donors?.map((donor) => (
                                <TableRow key={donor.id}>
                                    <TableCell>
                                        <div className="font-medium">{donor.name}</div>
                                        <div className="text-xs text-muted-foreground">{donor.contactNumber}</div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="text-sm">{donor.city}</div>
                                        <div className="text-xs text-muted-foreground">{donor.address}</div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className="font-bold border-[#e74c3c] text-[#e74c3c]">
                                            {donor.bloodGroup}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {donor.isVerified ? (
                                            <Badge className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                                                Verified
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-400 border-none">
                                                Pending
                                            </Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right space-x-2">
                                        {!donor.isVerified && (
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="border-green-200 text-green-600 hover:bg-green-50"
                                                onClick={() => verifyMutation.mutate(donor.id)}
                                                disabled={verifyMutation.isPending}
                                            >
                                                {verifyMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4 mr-1" />}
                                                Verify
                                            </Button>
                                        )}
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            className="border-red-100 text-red-500 hover:bg-red-50"
                                            onClick={() => {
                                                if (confirm("Are you sure you want to delete this donor?")) {
                                                    deleteMutation.mutate(donor.id);
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                        >
                                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 mr-1" />}
                                            Delete
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>

                    {donors?.length === 0 && (
                        <div className="text-center py-20 text-muted-foreground">
                            No donors found in the database.
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

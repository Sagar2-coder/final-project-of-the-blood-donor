import { Navbar } from "@/components/Navbar";
import { useDonors } from "@/hooks/use-donors";
import { DonorCard } from "@/components/DonorCard";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Loader2, Filter, Search, MapPin } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function DonorsList() {
  const [bloodGroup, setBloodGroup] = useState<string>("all");
  const [city, setCity] = useState<string>("");
  const { user } = useAuth();

  const { data: donors, isLoading, error } = useDonors({
    bloodGroup: bloodGroup === "all" ? undefined : bloodGroup,
    city: city || undefined,
    userType: "donor" // Default to showing donors in this list
  });

  return (
    <div className="min-h-screen bg-gray-50/50">
      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">Find a Donor</h1>
            <p className="text-muted-foreground">Search for eligible blood donors in your area.</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
            <div className="flex-1 sm:w-64">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Search City</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Enter city..."
                  className="pl-9 bg-white"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full sm:w-48">
              <label className="text-xs font-semibold text-muted-foreground uppercase mb-1.5 block">Blood Group</label>
              <Select value={bloodGroup} onValueChange={setBloodGroup}>
                <SelectTrigger className="bg-white">
                  <SelectValue placeholder="All Groups" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Groups</SelectItem>
                  <SelectItem value="A+">A+</SelectItem>
                  <SelectItem value="A-">A-</SelectItem>
                  <SelectItem value="B+">B+</SelectItem>
                  <SelectItem value="B-">B-</SelectItem>
                  <SelectItem value="AB+">AB+</SelectItem>
                  <SelectItem value="AB-">AB-</SelectItem>
                  <SelectItem value="O+">O+</SelectItem>
                  <SelectItem value="O-">O-</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 text-[#e74c3c] animate-spin mb-4" />
            <p className="text-muted-foreground animate-pulse">Searching for donors...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-[#e74c3c]/5 rounded-3xl border border-[#e74c3c]/20">
            <p className="text-[#e74c3c] font-semibold">Failed to load donors</p>
            <Button variant="link" className="text-[#e74c3c] underline" onClick={() => window.location.reload()}>
              Try again
            </Button>
          </div>
        ) : donors?.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border border-dashed border-border shadow-sm">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
              <Search className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">No donors found</h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              We couldn't find any donors matching your criteria. Try adjusting your filters or check back later.
            </p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {donors?.map((donor) => (
              <DonorCard key={donor.id} donor={donor} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

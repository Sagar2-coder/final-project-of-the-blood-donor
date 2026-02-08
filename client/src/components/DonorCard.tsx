import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, Calendar, ShieldCheck, CheckCircle } from "lucide-react";
import { PublicDonorInfo } from "@shared/schema";
import { format } from "date-fns";
import { useAuth } from "@/hooks/use-auth";
import { Link } from "wouter";

export function DonorCard({ donor }: { donor: PublicDonorInfo }) {
  const { user } = useAuth();

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow border-none bg-white shadow-md relative group">
      {donor.isVerified && (
        <div className="absolute top-2 right-2 z-10">
          <Badge variant="secondary" className="bg-green-100 text-green-700 border-green-200">
            <ShieldCheck className="w-3 h-3 mr-1" /> Verified
          </Badge>
        </div>
      )}

      <CardHeader className="bg-gradient-to-r from-[#e74c3c]/5 to-[#c0392b]/5 border-b border-border/50 pb-4">
        <div className="flex items-center justify-between">
          <div className="text-xl font-bold text-foreground">{donor.name}</div>
          <Badge className="bg-[#e74c3c] text-white text-lg px-3 py-1 font-bold">
            {donor.bloodGroup}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pt-6 space-y-4">
        <div className="flex items-start gap-2 text-sm text-muted-foreground italic">
          <MapPin className="w-4 h-4 mt-0.5 text-primary" />
          <span>{donor.address}, {donor.city}</span>
        </div>

        <div className="flex items-center gap-2 text-sm">
          <Calendar className="w-4 h-4 text-primary" />
          <span className="font-medium text-foreground">Last Donation:</span>
          <span className="text-muted-foreground">{format(new Date(donor.lastDonationDate), "MMM dd, yyyy")}</span>
        </div>

        <div className="pt-2 border-t border-border/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="w-4 h-4 text-green-500" />
            <span className="text-xs font-semibold text-green-600 uppercase">Available</span>
          </div>

          <div className="flex items-center gap-2">
            {!user ? (
              <Link href="/auth">
                <Button variant="ghost" size="sm" className="text-primary hover:text-primary hover:bg-primary/10 p-0 h-auto">
                  Login to view contact
                </Button>
              </Link>
            ) : (
              <div className="flex items-center gap-2 text-primary font-bold">
                <Phone className="w-4 h-4" />
                <span>{donor.contactNumber}</span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

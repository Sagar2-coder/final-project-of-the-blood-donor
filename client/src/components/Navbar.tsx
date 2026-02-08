import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Heart, LogOut, User, ShieldCheck } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Navbar() {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();

  const isActive = (path: string) => location === path;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="bg-[#e74c3c]/10 p-2 rounded-full group-hover:bg-[#e74c3c]/20 transition-colors">
            <Heart className="h-6 w-6 text-[#e74c3c] fill-[#e74c3c]" />
          </div>
          <span className="text-xl font-bold font-display tracking-tight text-foreground">
            TheBloodDonor
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-6">
          <Link href="/donors" className={`text-sm font-medium transition-colors hover:text-[#e74c3c] ${isActive('/donors') ? 'text-[#e74c3c]' : 'text-muted-foreground'}`}>
            Find Donors
          </Link>
          {user && (
            <Link href="/register-donor" className={`text-sm font-medium transition-colors hover:text-[#e74c3c] ${isActive('/register-donor') ? 'text-[#e74c3c]' : 'text-muted-foreground'}`}>
              My Donor Profile
            </Link>
          )}
        </div>

        <div className="flex items-center gap-4">
          {!user ? (
            <Link href="/auth">
              <Button variant="default" className="rounded-full px-6 bg-[#e74c3c] hover:bg-[#c0392b] shadow-lg shadow-[#e74c3c]/20">
                Sign In
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-4">
              {user.isAdmin && (
                <Link href="/admin">
                  <Button variant="outline" className="hidden sm:flex border-[#e74c3c]/20 text-[#e74c3c] hover:bg-[#e74c3c]/5">
                    <ShieldCheck className="w-4 h-4 mr-2" /> Admin Panel
                  </Button>
                </Link>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full ring-2 ring-[#e74c3c]/10 hover:ring-[#e74c3c]/20">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.profileImageUrl || ""} alt={user.username} />
                      <AvatarFallback className="bg-[#e74c3c]/5 text-[#e74c3c]">
                        {user.username?.[0].toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{user.username}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/register-donor" className="w-full cursor-pointer">
                      Donor Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => logoutMutation.mutate()} className="text-red-600 focus:text-red-600 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

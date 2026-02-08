import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowRight, Heart, Users, CalendarCheck, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/hooks/use-auth";

export default function Home() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-32 md:pt-32 md:pb-48">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />

        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-2xl"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-6">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                Saving Lives Together
              </div>
              <h1 className="text-5xl md:text-7xl font-display font-bold leading-tight mb-6">
                Donate Blood, <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-rose-600">
                  Save a Life.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed max-w-lg">
                Connect with eligible donors in your area. Our platform ensures safety and privacy while bridging the gap between donors and those in need.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/donors">
                  <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/30 transition-all duration-300">
                    Find Donors <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
                <Link href={user ? "/register-donor" : "/auth"}>
                  <Button variant="outline" size="lg" className="h-14 px-8 text-lg rounded-full border-2">
                    {user ? "Register as Donor" : "Get Started"}
                  </Button>
                </Link>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative hidden lg:block"
            >
              <div className="absolute top-0 right-0 -z-10 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
              <div className="relative z-10 grid grid-cols-2 gap-6">
                <img
                  src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?q=80&w=1000&auto=format&fit=crop"
                  alt="Medical professional with blood bag"
                  className="rounded-3xl shadow-2xl object-cover h-64 w-full translate-y-12"
                />
                <img
                  src="https://images.unsplash.com/photo-1579154204601-01588f351e67?q=80&w=1000&auto=format&fit=crop"
                  alt="Hands holding heart"
                  className="rounded-3xl shadow-2xl object-cover h-64 w-full"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-background p-8 rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <Users className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Community First</h3>
              <p className="text-muted-foreground">Join a growing network of heroes ready to help in emergencies.</p>
            </div>
            <div className="bg-background p-8 rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <CalendarCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Smart Eligibility</h3>
              <p className="text-muted-foreground">We automatically filter donors based on the 3-month donation rule.</p>
            </div>
            <div className="bg-background p-8 rounded-3xl shadow-sm border border-border/50 hover:shadow-md transition-shadow">
              <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 text-primary">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3">Privacy Protected</h3>
              <p className="text-muted-foreground">Contact details are private. Connect safely through our platform.</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="bg-background border-t border-border py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-6 w-6 text-primary fill-primary" />
            <span className="text-xl font-bold font-display tracking-tight text-primary">TheBloodDonor</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2026 TheBloodDonor. Saving lives, one donation at a time.</p>
        </div>
      </footer>
    </div>
  );
}

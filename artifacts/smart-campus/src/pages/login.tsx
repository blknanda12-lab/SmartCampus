import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLogin } from "@workspace/api-client-react";
import { motion } from "framer-motion";
import {
  Building2,
  Shield,
  GraduationCap,
  User as UserIcon,
  Sparkles,
  ArrowRight,
  Activity,
  Wifi,
  Calendar,
  MapPin,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

interface DemoRole {
  email: string;
  password: string;
  role: "Admin" | "Faculty" | "Student";
  title: string;
  subtitle: string;
  icon: typeof Shield;
  color: string;
  ring: string;
}

const ROLES: DemoRole[] = [
  {
    email: "admin@smartcampus.edu",
    password: "admin123",
    role: "Admin",
    title: "Operations Lead",
    subtitle: "Campus-wide analytics, IoT control, every booking",
    icon: Shield,
    color: "text-emerald-300",
    ring: "ring-emerald-400/40 hover:ring-emerald-400/80",
  },
  {
    email: "faculty@smartcampus.edu",
    password: "faculty123",
    role: "Faculty",
    title: "Faculty",
    subtitle: "Reserve lecture halls, labs, and teaching spaces",
    icon: GraduationCap,
    color: "text-indigo-300",
    ring: "ring-indigo-400/40 hover:ring-indigo-400/80",
  },
  {
    email: "student@smartcampus.edu",
    password: "student123",
    role: "Student",
    title: "Student",
    subtitle: "Find study rooms, equipment, available seats",
    icon: UserIcon,
    color: "text-amber-300",
    ring: "ring-amber-400/40 hover:ring-amber-400/80",
  },
];

const STATS = [
  { icon: Building2, label: "Resources tracked", value: "20" },
  { icon: Calendar, label: "Bookings managed", value: "60+" },
  { icon: Wifi, label: "Live sensors", value: "Realtime" },
  { icon: MapPin, label: "Buildings", value: "3" },
];

export default function Login() {
  const { login } = useAuth();
  const loginMutation = useLogin();
  const [pending, setPending] = useState<string | null>(null);

  const handleDemoLogin = (r: DemoRole) => {
    setPending(r.role);
    loginMutation.mutate(
      { data: { email: r.email, password: r.password } },
      {
        onSuccess: (data) => {
          toast.success(`Welcome back, ${data.user.name}`, {
            description: `Signed in as ${r.role}`,
          });
          login(data);
        },
        onError: () => {
          toast.error("Login failed", {
            description: "Demo credentials are misconfigured. Try again in a moment.",
          });
          setPending(null);
        },
      },
    );
  };

  return (
    <div className="min-h-screen w-full flex items-stretch bg-background text-foreground relative overflow-hidden">
      {/* Animated gradient mesh background */}
      <div className="absolute inset-0 bg-mesh opacity-70 pointer-events-none" />
      <div className="absolute inset-0 bg-grid opacity-[0.07] pointer-events-none" />
      <motion.div
        aria-hidden
        className="absolute -top-40 -left-40 w-[40rem] h-[40rem] rounded-full bg-primary/30 blur-3xl"
        animate={{ scale: [1, 1.2, 1], opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 12, repeat: Infinity }}
      />
      <motion.div
        aria-hidden
        className="absolute -bottom-40 -right-40 w-[40rem] h-[40rem] rounded-full bg-accent/30 blur-3xl"
        animate={{ scale: [1.1, 1, 1.1], opacity: [0.3, 0.55, 0.3] }}
        transition={{ duration: 14, repeat: Infinity, delay: 2 }}
      />

      {/* Left brand panel */}
      <div className="hidden lg:flex flex-1 flex-col justify-between p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3"
        >
          <div className="h-11 w-11 rounded-2xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
              Smart Campus
            </div>
            <div className="font-display font-bold text-lg leading-tight">
              Resource Optimization Platform
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="space-y-6 max-w-xl"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 bg-card/60 backdrop-blur ring-1 ring-border text-xs">
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            <span className="text-muted-foreground">
              AI-assisted scheduling · Live IoT occupancy · Energy aware
            </span>
          </div>
          <h1 className="font-display font-bold text-5xl xl:text-6xl leading-[1.05] tracking-tight">
            Every classroom,{" "}
            <span className="text-gradient">every lab</span>, every parking spot.{" "}
            <br />
            <span className="text-muted-foreground">In one mission control.</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg">
            Smart Campus turns the entire university into a living, bookable map.
            Faculty plan with confidence, students find space instantly, ops gets
            real-time analytics and AI nudges to cut waste.
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4">
            {STATS.map((s, i) => (
              <motion.div
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + i * 0.06 }}
                className="rounded-2xl glass p-4"
              >
                <s.icon className="h-4 w-4 text-primary mb-3" />
                <div className="font-display font-bold text-2xl">{s.value}</div>
                <div className="text-[11px] uppercase tracking-wider text-muted-foreground mt-1">
                  {s.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="flex items-center gap-2 text-xs text-muted-foreground"
        >
          <Activity className="h-3.5 w-3.5 text-emerald-400" />
          <span>System nominal · 20 sensors live · 99.98% uptime</span>
        </motion.div>
      </div>

      {/* Right login panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="w-full max-w-md"
        >
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="h-11 w-11 rounded-2xl bg-primary/15 ring-1 ring-primary/40 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                Smart Campus
              </div>
              <div className="font-display font-bold leading-tight">
                Resource Optimization
              </div>
            </div>
          </div>

          <div className="rounded-3xl glass shadow-2xl p-8">
            <div className="mb-7">
              <div className="inline-flex items-center gap-2 text-xs text-primary mb-3">
                <span className="h-1.5 w-1.5 rounded-full bg-primary pulse-dot" />
                <span className="uppercase tracking-[0.18em]">Demo Access</span>
              </div>
              <h2 className="font-display text-3xl font-bold tracking-tight">
                Step inside the platform
              </h2>
              <p className="text-muted-foreground mt-2 text-sm">
                Pick a role to instantly explore Smart Campus with seeded data.
              </p>
            </div>

            <div className="space-y-3">
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                const isPending = pending === r.role && loginMutation.isPending;
                return (
                  <motion.button
                    key={r.role}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 + i * 0.07 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    disabled={loginMutation.isPending}
                    onClick={() => handleDemoLogin(r)}
                    className={`group w-full text-left rounded-2xl p-4 bg-card/40 hover:bg-card/70 ring-1 ${r.ring} transition-all flex items-center gap-4 disabled:opacity-60`}
                  >
                    <div className="h-12 w-12 rounded-xl bg-background/60 ring-1 ring-border flex items-center justify-center shrink-0">
                      <Icon className={`h-5 w-5 ${r.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{r.title}</span>
                        <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-foreground/10 text-muted-foreground">
                          {r.role}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5 truncate">
                        {r.subtitle}
                      </div>
                      <div className="text-[10px] font-mono text-muted-foreground/70 mt-1 truncate">
                        {r.email}
                      </div>
                    </div>
                    <ArrowRight
                      className={`h-4 w-4 text-muted-foreground transition-transform ${isPending ? "animate-pulse" : "group-hover:translate-x-1"}`}
                    />
                  </motion.button>
                );
              })}
            </div>

            <Button
              variant="ghost"
              className="w-full mt-6 text-muted-foreground hover:text-foreground text-xs"
              disabled
            >
              <span>Use email & password (coming soon)</span>
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Built for the Smart Campus hackathon · Mumbai
          </p>
        </motion.div>
      </div>
    </div>
  );
}

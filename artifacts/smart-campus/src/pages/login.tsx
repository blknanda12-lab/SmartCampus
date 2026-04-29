import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useLogin, customFetch, AuthResponse } from "@workspace/api-client-react";
import { motion, AnimatePresence } from "framer-motion";
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
  Mail,
  Lock,
  UserPlus,
  LogIn,
  Library,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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
  const [activeTab, setActiveTab] = useState("login");

  // Form states
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const [regName, setRegName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regRole, setRegRole] = useState("student");
  const [regDept, setRegDept] = useState("");

  const registerMutation = useMutation({
    mutationFn: (data: any) =>
      customFetch<AuthResponse>("/api/auth/register", {
        method: "POST",
        body: JSON.stringify(data),
      }),
  });

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
            description: "Demo credentials are misconfigured.",
          });
          setPending(null);
        },
      },
    );
  };

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setPending("manual");
    loginMutation.mutate(
      { data: { email: loginEmail, password: loginPassword } },
      {
        onSuccess: (data) => {
          toast.success(`Welcome back, ${data.user.name}`);
          login(data);
        },
        onError: (err: any) => {
          toast.error("Login failed", {
            description: err.data?.error || "Check your email and password.",
          });
          setPending(null);
        },
      },
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setPending("register");
    registerMutation.mutate(
      {
        email: regEmail,
        password: regPassword,
        name: regName,
        role: regRole,
        department: regDept || "General",
      },
      {
        onSuccess: (data) => {
          toast.success("Account created!", {
            description: "Welcome to the Smart Campus community.",
          });
          login(data);
        },
        onError: (err: any) => {
          toast.error("Registration failed", {
            description: err.data?.error || "Something went wrong.",
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
            <Tabs defaultValue="login" className="w-full" onValueChange={setActiveTab}>
              <TabsList className="grid w-full grid-cols-2 mb-8 rounded-2xl p-1 bg-muted/40">
                <TabsTrigger value="login" className="rounded-xl flex items-center gap-2 transition-all">
                  <LogIn className="h-4 w-4" />
                  <span>Login</span>
                </TabsTrigger>
                <TabsTrigger value="register" className="rounded-xl flex items-center gap-2 transition-all">
                  <UserPlus className="h-4 w-4" />
                  <span>Sign Up</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Welcome Back</h2>
                  <p className="text-muted-foreground mt-1 text-sm">Enter your credentials to access the campus.</p>
                </div>

                <form onSubmit={handleManualLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="name@university.edu"
                        className="pl-10 rounded-xl"
                        required
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <button type="button" className="text-xs text-primary hover:underline">Forgot?</button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type="password"
                        placeholder="••••••••"
                        className="pl-10 rounded-xl"
                        required
                        value={loginPassword}
                        onChange={(e) => setLoginPassword(e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl h-11 font-bold shadow-lg shadow-primary/20"
                    disabled={loginMutation.isPending}
                  >
                    {pending === "manual" ? "Signing in..." : "Sign In"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="register">
                <div className="mb-6">
                  <h2 className="font-display text-2xl font-bold tracking-tight">Create Account</h2>
                  <p className="text-muted-foreground mt-1 text-sm">Join the resource optimization platform.</p>
                </div>

                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      placeholder="Academic Full Name"
                      className="rounded-xl"
                      required
                      value={regName}
                      onChange={(e) => setRegName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="reg-role">Your Role</Label>
                      <Select value={regRole} onValueChange={setRegRole}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Role" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="student">Student</SelectItem>
                          <SelectItem value="faculty">Faculty</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dept">Department</Label>
                      <Input
                        id="dept"
                        placeholder="e.g. CS"
                        className="rounded-xl"
                        required
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-email">University Email</Label>
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="name@university.edu"
                      className="rounded-xl"
                      required
                      value={regEmail}
                      onChange={(e) => setRegEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reg-password">Password</Label>
                    <Input
                      id="reg-password"
                      type="password"
                      placeholder="Choose a strong password"
                      className="rounded-xl"
                      required
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                    />
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-xl h-11 font-bold shadow-lg shadow-primary/20"
                    disabled={registerMutation.isPending}
                  >
                    {pending === "register" ? "Creating..." : "Create Account"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>

            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">Or demo shortcut</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {ROLES.map((r, i) => {
                const Icon = r.icon;
                const isPending = pending === r.role && loginMutation.isPending;
                return (
                  <button
                    key={r.role}
                    disabled={loginMutation.isPending}
                    onClick={() => handleDemoLogin(r)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl bg-card/40 hover:bg-card/70 ring-1 ${r.ring} transition-all disabled:opacity-50`}
                  >
                    <Icon className={`h-5 w-5 mb-2 ${r.color}`} />
                    <span className="text-[10px] font-bold uppercase tracking-wider">{r.role}</span>
                    {isPending && <Activity className="h-3 w-3 mt-1 animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Built for PESIT Shivamogga · Smart Campus
          </p>
        </motion.div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { authService } from "@/services/authService";
import { Lock, Mail, Satellite } from "lucide-react";
import GoogleAuthButton from "@/components/GoogleAuthBtn";
import api from "@/lib/api";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotLoading, setForgotLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Try to authenticate with BullReckon auth server
      const result = await authService.login(email, password);

      if (result.status === "success") {
        toast({
          title: "Welcome back!",
          description: "You have successfully logged in.",
        });
        router.push("/dashboard");
      } else {
        throw new Error(result.message || "Login failed");
      }
    } catch (err) {
      console.log(err);
      toast({
        title: "Login failed",
        description: "Invalid email or password.",
        variant: "destructive",
      });
    }

    setIsLoading(false);
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotLoading(true);
    try {
      const user = await authService.getUser();
      await api.post("/api/auth/request-password-mail", { email: user.email });
      localStorage.setItem("mailConfirmationRequested", "forgot");
      await new Promise((resolve) => setTimeout(resolve, 200));
      router.push("/auth/post-register-mail-confirmation?type=forgot");
      toast({ title: "Password reset email sent!" });
    } catch (err) {
      toast({
        title: "Failed to send reset email",
        description: String(err),
        variant: "destructive",
      });
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl text-white rounded-2xl">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center mb-4">
            <Satellite className="w-12 h-12 text-indigo-400 drop-shadow-lg" />
          </div>
          <CardTitle className="text-3xl font-bold text-white mb-2">
            Welcome to LunarLens
          </CardTitle>
          <CardDescription className="text-slate-300 text-base">
            Sign in to analyze lunar XRF spectra and explore the cosmos.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-8 pb-8">
          {showForgot ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4 text-center">Forgot Password</h2>
              <form onSubmit={handleForgotPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgotEmail" className="text-slate-200">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="forgotEmail"
                      type="email"
                      placeholder="scientist@example.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="pl-12 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                      required
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  disabled={forgotLoading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors"
                >
                  {forgotLoading ? "Sending..." : "Send Reset Email"}
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setShowForgot(false)}
                  className="w-full mt-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg"
                >
                  Back to Login
                </Button>
              </form>
            </div>
          ) : (
            <form onSubmit={handleLogin} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-slate-200">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="scientist@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-12 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-200">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-12 bg-white/10 border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 rounded-lg"
                    required
                  />
                </div>
              </div>

              <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors" disabled={isLoading}>
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
              <Button
                type="button"
                variant="link"
                onClick={() => setShowForgot(true)}
                className="w-full mt-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-lg py-2"
              >
                Forgot Password?
              </Button>
            </form>
          )}

          <div className="mt-8 text-center text-sm">
            <p className="text-slate-300 mb-4">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="text-indigo-400 hover:text-indigo-300 font-medium underline"
              >
                Sign up
              </Link>
            </p>
            <GoogleAuthButton />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;

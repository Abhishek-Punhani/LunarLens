"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import api from "@/lib/api";

const ResetPasswordPage = () => {
  const router = useRouter();
  const params = useParams();
  const token =
    params?.token === undefined
      ? ""
      : Array.isArray(params.token)
      ? params.token[0]
      : params.token;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords do not match", variant: "destructive" });
      return;
    }
    setLoading(true);
    try {
      await api.post(`${process.env.NEXT_PUBLIC_AUTH_SERVER}/api/auth/change-password`, {
        token,
        newPassword,
      });
      toast({ title: "Password changed successfully!" });
      router.push("/auth/login");
    } catch (err: unknown) {
      const description = err.error.message;
      toast({
        title: "Failed to reset password",
        description,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 flex items-center justify-center p-6">
      <Card className="w-full max-w-md bg-white/5 backdrop-blur-lg border border-white/10 shadow-2xl p-8">
        <header className="mb-6 text-center">
          <h1 className="text-2xl font-extrabold text-white">Reset your password</h1>
          <p className="mt-2 text-sm text-slate-200/80">
            Choose a new secure password for your account. This link will expire after use.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">New Password</label>
            <Input
              type="password"
              placeholder="Enter new password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              className="bg-white/3 border border-white/6 text-white placeholder-slate-400"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-200 mb-2">Confirm New Password</label>
            <Input
              type="password"
              placeholder="Confirm new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="bg-white/3 border border-white/6 text-white placeholder-slate-400"
            />
          </div>

          <div className="text-xs text-slate-300/80">
            <p className="mb-2">Password requirements:</p>
            <ul className="list-inside list-disc space-y-1 pl-4">
              <li>At least 8 characters</li>
              <li>Include uppercase and lowercase letters</li>
              <li>Include a number or special character</li>
            </ul>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary/90 text-white font-medium"
            >
              {loading ? "Resetting..." : "Reset Password"}
            </Button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => router.push("/auth/login")}
              className="text-sm text-slate-200/80 hover:text-white underline"
            >
              Back to sign in
            </button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default ResetPasswordPage;

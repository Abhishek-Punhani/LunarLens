"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Satellite, CheckCircle2 } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const MailSentPageInner = () => {
  const searchParams = useSearchParams();
  const type = (searchParams.get("type") as "activate" | "reset" | "forgot") || "activate";

  // Titles & messages based on type
  const title = type === "activate" ? "Verification Email Sent!" : "Password Reset Email Sent!";
  const heading = type === "activate" ? "Activate your account" : "Reset your password";
  const message =
    type === "activate"
      ? "We've sent a verification link to your email. Please check your inbox and follow the instructions to activate your account. If you don't see the email, check your spam folder."
      : "We've sent a password reset link to your email. Please check your inbox and follow the instructions to reset your password. If you don't see the email, check your spam folder.";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-6">
        {/* Brand Header */}
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Satellite className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              LunarLens
            </h1>
          </div>
          <p className="text-slate-400 text-lg">{heading}</p>
        </div>

        {/* Confirmation Card */}
        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl">
          <CardHeader className="text-center space-y-3 pb-4">
            <CheckCircle2 className="mx-auto h-16 w-16 text-green-500" />
            <CardTitle className="text-2xl text-white">{title}</CardTitle>
            <CardDescription className="text-slate-400">{message}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <Link
              href="/auth/login"
              className="block w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg text-center transition-colors"
            >
              Back to Login
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default function MailSentPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MailSentPageInner />
    </Suspense>
  );
}

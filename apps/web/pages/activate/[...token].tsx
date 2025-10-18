"use client";
import axios from "axios";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";

export default function ActivateEmail() {
  const router = useRouter();
  const params = useParams();
  const tokenParam = params?.token ?? null;
  const token =
    Array.isArray(tokenParam) ? tokenParam.join("") : tokenParam ?? null;
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      async function verifyToken() {
        try {
          const res = await axios.post(
            `${process.env.NEXT_PUBLIC_AUTH_SERVER}/api/auth/verify-email`,
            { token }
          );
          if (res.status === 200) {
            toast({
              title: "Email Verified",
              description: "You can now login to your account.",
            });
          } else {
            throw new Error("Verification failed");
          }
        } catch (error: unknown) {
          if (axios.isAxiosError(error)) {
            const data = error.response?.data;
            let msg = "Failed to verify email.";
            if (typeof data === "object" && data !== null && "message" in data) {
              const maybeMessage = (data as { message?: unknown }).message;
              if (typeof maybeMessage === "string") {
                msg = maybeMessage;
              }
            }
            toast({
              title: "Error",
              description: msg,
              variant: "destructive",
            });
          } else if (error instanceof Error) {
            toast({
              title: "Error",
              description: error.message || "Failed to verify email.",
              variant: "destructive",
            });
          } else {
            toast({
              title: "Error",
              description: "Failed to verify email.",
              variant: "destructive",
            });
          }
        } finally {
          setLoading(false);
        }
      }
      verifyToken();
    } else {
      // No token present: stop loading and redirect to login
      setLoading(false);
    }
  }, [token, toast]);

  useEffect(() => {
    if (!loading) {
      router.replace("/auth/login");
    }
  }, [loading, router]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "60vh",
      }}
    >
      Loading ...
    </div>
  );
}

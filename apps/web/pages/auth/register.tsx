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
import { Satellite, Mail, Lock, User, Image as ImageIcon } from "lucide-react";
import { uploadFiles } from "@/lib/upload";
import Image from "next/image";
import { authService } from "@/services/authService";
import GoogleAuthButton from "@/components/GoogleAuthBtn";
import { AutoSaveProvider } from "@/hooks/AutoSaveContext";

const RegisterPage = () => {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (authService.isAuthenticated()) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      let photoUrl: string | null = null;

      // if photo selected → upload to Cloudinary
      if (image) {
        const uploaded = await uploadFiles([
          { file: image, type: "image", message: "profile" },
        ]);
        photoUrl = uploaded[0]?.file?.secure_url || null;
      }
      const result = await authService.register(
        email,
        password,
        firstName,
        lastName,
        photoUrl || undefined
      );

      if (result.status === "success") {
        toast({
          title: "Registration successful!",
          description: "Please check your email to verify your account.",
        });
        localStorage.removeItem("registerForm");
      } else {
        throw new Error(result.message || "Registration failed");
      }
      //eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      toast({
        title: "Registration failed",
        description: error.message || "An error occurred.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      localStorage.setItem("mailConfirmationRequested", "activate");
      await new Promise((resolve) => setTimeout(resolve, 200));
      router.push("/auth/post-register-mail-confirmation?type=activate");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Satellite className="h-10 w-10 text-blue-400" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
              LunarLens
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Join LunarLens for advanced lunar XRF analysis
          </p>
        </div>

        <Card className="bg-slate-800/50 backdrop-blur-sm border-slate-700 shadow-2xl">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl text-center text-white">Sign Up</CardTitle>
            <CardDescription className="text-center text-slate-400">
              Enter your details to start exploring the cosmos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <AutoSaveProvider
              storageKey="registerForm"
              formData={{ firstName, lastName, email, password }}
              setFormData={({
                firstName,
                lastName,
                email,
                password,
              }) => {
                setFirstName(firstName ?? "");
                setLastName(lastName ?? "");
                setEmail(email ?? "");
                setPassword(password ?? "");
              }}
            >
              <form onSubmit={handleRegister} className="space-y-6">
                {/* Optional Profile Photo */}
                <div className="space-y-3">
                  <Label htmlFor="photo" className="font-medium text-white">
                    Profile Photo{" "}
                    <span className="text-sm text-slate-400">
                      (Optional)
                    </span>
                  </Label>
                  <div className="relative flex items-center gap-4">
                    <div className="flex-shrink-0 w-14 h-14 rounded-full bg-slate-700 flex items-center justify-center overflow-hidden border-2 border-slate-600">
                      {image ? (
                        <Image
                          src={URL.createObjectURL(image)}
                          alt="Profile Preview"
                          width={56}
                          height={56}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-7 w-7 text-slate-400" />
                      )}
                    </div>
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700 pl-0 text-white"
                      onChange={(e) => {
                        if (e.target.files?.[0]) {
                          setImage(e.target.files[0]);
                        }
                      }}
                    />
                  </div>
                  {image && (
                    <button
                      type="button"
                      className="text-sm text-red-400 hover:text-red-300 hover:underline mt-2"
                      onClick={() => setImage(null)}
                    >
                      Remove photo
                    </button>
                  )}
                </div>
                {/* First Name */}
                <div className="space-y-2">
                  <Label htmlFor="firstName" className="text-white">First Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="firstName"
                      type="text"
                      placeholder="John"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <Label htmlFor="lastName" className="text-white">Last Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      required
                      minLength={2}
                      maxLength={50}
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="trader@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      required
                    />
                  </div>
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-12 bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-blue-500"
                      required
                      minLength={8}
                    />
                  </div>
                  <p className="text-sm text-slate-400 mt-2">
                    Must contain at least one uppercase letter, one lowercase
                    letter, and one number.
                  </p>
                </div>

                <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-lg transition-colors" disabled={isLoading}>
                  {isLoading ? "Signing up..." : "Sign Up"}
                </Button>
              </form>
            </AutoSaveProvider>

            <div className="mt-8 text-center text-sm">
              <p className="text-slate-400">
                Already have an account?{" "}
                <Link
                  href="/auth/login"
                  className="text-blue-400 hover:text-blue-300 hover:underline"
                >
                  Sign in
                </Link>
              </p>
              <br />
              <GoogleAuthButton />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RegisterPage;

"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { authService } from "@/services/authService";
import { uploadFiles } from "@/lib/upload";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Camera, User, Mail, LogOut } from "lucide-react";

const ProfilePage = () => {
    const [mounted, setMounted] = useState(false);
    const router = useRouter();
    const toast = useToast().toast;
    const user = authService.getUser();
    const [editing, setEditing] = useState(false);
    const [firstName, setFirstName] = useState(user?.firstName || "");
    const [lastName, setLastName] = useState(user?.lastName || "");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState(user?.photo || "");
    const [uploading, setUploading] = useState(false);
    const [resetting, setResetting] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // avoid hydration mismatch
    useEffect(() => {
        setMounted(true);
    }, []);
    if (!mounted) return null;

    const getInitials = () => {
        const parts = [
            user?.firstName || "",
            user?.lastName || "",
            ...(user?.name ? [user.name] : []),
        ]
            .join(" ")
            .split(" ")
            .map((p) => p[0])
            .filter(Boolean)
            .join("");
        return parts.toUpperCase() || "U";
    };

    const handlePhotoChange = (file: File) => {
        setPhotoFile(file);
        const reader = new FileReader();
        reader.onloadend = () => setPhotoPreview(reader.result as string);
        reader.readAsDataURL(file);
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setUploading(true);
        try {
            let photoUrl = user?.photo || "";
            if (photoFile) {
                const uploaded = await uploadFiles([
                    { file: photoFile, type: "image" },
                ]);
                photoUrl =
                    uploaded[0]?.file?.secure_url || uploaded[0]?.file?.url || "";
            }
            await authService.updateProfile({ firstName, lastName, photo: photoUrl });
            toast({ title: "Profile updated!" });
            setEditing(false);
        } catch (err) {
            toast({
                title: "Update failed",
                description: (err as Error).message,
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    const handlePasswordReset = async () => {
        setResetting(true);
        try {
            await api.post(
                `${process.env.NEXT_PUBLIC_AUTH_SERVER}/api/auth/request-password-mail`,
                {
                    email: user?.email,
                    type: "forgot",
                }
            );
            toast({ title: "Reset email sent!" });
            localStorage.setItem("mailConfirmationRequested", "reset");
            await new Promise((r) => setTimeout(r, 200));
            router.push("/auth/post-register-mail-confirmation?type=reset");
        } catch (err) {
            toast({
                title: "Failed to send email",
                description: (err as Error).message,
                variant: "destructive",
            });
        } finally {
            setResetting(false);
        }
    };

    const handleLogout = async () => {
        try {
            await authService.logout();
            toast({ title: "Logged out successfully!" });
            router.push("/"); // Adjust the path as needed
        } catch (err) {
            toast({
                title: "Logout failed",
                description: (err as Error).message,
                variant: "destructive",
            });
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-indigo-900 to-slate-800 p-4">
            <div className="w-full max-w-3xl space-y-8">
                <h1 className="text-4xl font-extrabold text-center text-white">
                    Profile Settings
                </h1>

                <Card className="bg-white/10 backdrop-blur-lg border border-white/20 shadow-2xl p-8">
                    {user ? (
                        editing ? (
                            <form onSubmit={handleProfileUpdate} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {/* Avatar + Upload */}
                                    <div className="flex flex-col items-center">
                                        <div className="relative">
                                            <Avatar className="w-32 h-32 ring-4 ring-primary">
                                                <AvatarImage
                                                    src={photoPreview || user.photo || ""}
                                                    alt={getInitials()}
                                                    className="object-cover"
                                                />
                                                <AvatarFallback className="text-4xl bg-muted">
                                                    {getInitials()}
                                                </AvatarFallback>
                                            </Avatar>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                ref={fileInputRef}
                                                className="hidden"
                                                onChange={(e) => {
                                                    const f = e.target.files?.[0];
                                                    if (f) handlePhotoChange(f);
                                                }}
                                            />
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                className="absolute bottom-0 right-0 bg-primary p-2 rounded-full hover:bg-primary/80 transition-colors"
                                            >
                                                <Camera className="h-5 w-5 text-primary-foreground" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Name Inputs */}
                                    <div className="space-y-4">
                                        <Input
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            placeholder="First Name"
                                            className="bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 rounded-lg"
                                            required
                                        />
                                        <Input
                                            value={lastName}
                                            onChange={(e) => setLastName(e.target.value)}
                                            placeholder="Last Name"
                                            className="bg-white/10 border border-white/20 text-white placeholder-slate-400 focus:ring-2 focus:ring-blue-500 rounded-lg"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="flex justify-end space-x-4">
                                    <Button type="submit" disabled={uploading}>
                                        {uploading ? "Saving..." : "Save Changes"}
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => setEditing(false)}
                                    >
                                        Cancel
                                    </Button>
                                </div>
                            </form>
                        ) : (
                            <div className="space-y-8">
                                <div className="flex flex-col items-center space-y-4">
                                    <Avatar className="w-32 h-32 ring-4 ring-primary">
                                        <AvatarImage src={user.photo || ""} alt={getInitials()} />
                                        <AvatarFallback className="text-4xl bg-muted">
                                            {getInitials()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <h2 className="text-2xl font-semibold text-white">
                                        {user.name || `${user.firstName} ${user.lastName}`.trim()}
                                    </h2>
                                    <p className="text-sm text-slate-300">{user.email}</p>
                                </div>

                                <dl className="grid grid-cols-1 md:grid-cols-2 gap-6 text-white">
                                    <div className="flex items-center space-x-2">
                                        <User className="h-5 w-5 text-slate-400" />
                                        <dt className="font-medium">Full Name:</dt>
                                        <dd>
                                            {user.name || `${user.firstName} ${user.lastName}`.trim()}
                                        </dd>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Mail className="h-5 w-5 text-slate-400" />
                                        <dt className="font-medium">Email:</dt>
                                        <dd>{user.email}</dd>
                                    </div>
                                </dl>

                                <div className="flex justify-center md:justify-end space-x-4">
                                    <Button onClick={() => setEditing(true)}>Edit Profile</Button>
                                    <Button
                                        variant="outline"
                                        onClick={handlePasswordReset}
                                        disabled={resetting}
                                    >
                                        {resetting ? "Sending..." : "Reset Password"}
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        onClick={handleLogout}
                                    >
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Logout
                                    </Button>
                                </div>
                            </div>
                        )
                    ) : (
                        <div className="py-12 text-center">
                            <p className="text-lg text-slate-300">
                                No user info found. Please log in.
                            </p>
                        </div>
                    )}
                </Card>
            </div>
        </div>
    );
};

export default ProfilePage;

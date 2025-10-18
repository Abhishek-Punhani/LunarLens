import type { AppProps } from "next/app";
import dynamic from "next/dynamic";
import "../styles/globals.css";
import { Toaster } from "@/components/ui/toaster";
import Footer from "@/components/footer";
import { GoogleOAuthProvider } from "@react-oauth/google";

const Navbar = dynamic(() => import("@/components/Navbar"), { ssr: false });

export default function App({ Component, pageProps }: AppProps) {
  return (
    <>
      <Navbar />
      <GoogleOAuthProvider
        clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID as string}
      >
        <Component {...pageProps} />
      </GoogleOAuthProvider>
      <Footer />
      <Toaster />
    </>
  );
}

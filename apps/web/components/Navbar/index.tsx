"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Moon, Menu, X, LogOut } from "lucide-react";
import { authService } from "@/services/authService";
import { useRouter } from "next/router";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

interface User {
  name: string;
  photo?: string;
}

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  const handleLogout = () => {
    authService.logout();
    setUser(null);
    setUserMenuOpen(false);
    router.push("/");
  };

  useEffect(() => {
    setUser(authService.getUser());
  }, [router.pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="shadow-md sticky top-0 z-50 bg-gray-900 text-white px-8">
      <div className="w-full py-3">
        <div className="flex justify-between items-center w-full">
          <Link href="/" className="flex items-center space-x-2">
            <Moon className="h-8 w-8 text-blue-400" />
            <span className="text-xl font-bold">LunarLens</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link
              href="/"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                router.pathname === "/" ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
            >
              Home
            </Link>
            <Link
              href="/fits-viewer"
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                router.pathname === "/fits-viewer"
                  ? "bg-gray-800"
                  : "hover:bg-gray-800"
              }`}
            >
              FITS Viewer
            </Link>
          </div>

          {/* User Menu or Auth Links */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center cursor-pointer"
                >
                  <Avatar>
                    <AvatarImage src={user.photo} alt={user.name} />
                    <AvatarFallback>
                      {user.name ? user.name.charAt(0) : "U"}
                    </AvatarFallback>
                  </Avatar>
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white text-black rounded-lg shadow-lg">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-200"
                    >
                      <LogOut className="inline-block mr-2 h-4 w-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex space-x-4">
                <Link
                  href="/auth/login"
                  className="text-sm font-medium hover:text-blue-400"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="text-sm font-medium hover:text-blue-400"
                >
                  Register
                </Link>
              </div>
            )}
            <button className="md:hidden" onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 space-y-2">
            <Link
              href="/"
              className={`block px-4 py-2 text-sm font-medium ${
                router.pathname === "/" ? "bg-gray-800" : "hover:bg-gray-800"
              }`}
            >
              Home
            </Link>
            <Link
              href="/fits-viewer"
              className={`block px-4 py-2 text-sm font-medium ${
                router.pathname === "/fits-viewer"
                  ? "bg-gray-800"
                  : "hover:bg-gray-800"
              }`}
            >
              FITS Viewer
            </Link>
            {user ? null : (
              <>
                <Link
                  href="/auth/login"
                  className="block px-4 py-2 text-sm font-medium hover:bg-gray-800"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="block px-4 py-2 text-sm font-medium hover:bg-gray-800"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;

import React from "react";
import Link from "next/link";
import { Moon } from "lucide-react";
import { BsGithub, BsTwitter } from "react-icons/bs";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Moon className="h-8 w-8 text-blue-400" />
              <span className="text-xl font-bold">LunarLens</span>
            </div>
            <p className="text-gray-400">
              Advanced X-ray fluorescence (XRF) spectrum analysis for lunar
              surface exploration. Visualize elemental compositions and unlock
              the secrets of the Moon.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <BsGithub className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <BsTwitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/fits-viewer"
                  className="text-gray-400 hover:text-white"
                >
                  FITS Viewer
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/login"
                  className="text-gray-400 hover:text-white"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/auth/register"
                  className="text-gray-400 hover:text-white"
                >
                  Register
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Spectrum Analysis</li>
              <li className="text-gray-400">Element Detection</li>
              <li className="text-gray-400">Lunar Mapping</li>
              <li className="text-gray-400">Data Visualization</li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <p className="text-gray-400">support@lunarLens.com</p>
            <p className="text-gray-400">
              © 2025 LunarLens. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

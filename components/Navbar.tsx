import React from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";

const FloatingNavbar = () => {
  return (
    <nav className="fixed w-[70%] top-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className="
        flex items-center justify-between gap-10
        rounded-full
        border border-white/10
        bg-black/20
        px-8 py-4
        shadow-lg
        backdrop-blur-xl
      "
      >
        {/* --- Logo --- */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-emerald-500/50 rounded-full blur-[20px] animate-pulse" />
            <Image src="/logo.png" alt="Pokemon" width={32} height={32} />
          </div>
          <div className="hidden text-white text-xl font-bold sm:block">
            Pokemon
          </div>
        </div>

        {/* --- Nav Links with Hover Effect --- */}
        <div className="hidden items-center gap-6 md:flex">
          <a
            href="#"
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Home</span>
            <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <a
            href="#"
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>About</span>
            <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <a
            href="#"
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Features</span>
            <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <a
            href="#"
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Pricing</span>
            <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <a
            href="#"
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Contact</span>
            <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
        </div>

        {/* --- Auth Links with Hover Effect --- */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="#"
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Login</span>
            <span className="absolute left-0 -bottom-1 w-full h-[1px] bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </a>
          <Button
            variant="outline"
            className="rounded-full border-emerald-500 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300"
          >
            Sign Up
          </Button>
        </div>

        {/* --- Mobile Menu --- */}
        <div className="flex md:hidden">
          <Button size="icon" variant="ghost" className="rounded-full">
            <Menu className="h-5 w-5 text-white" />
          </Button>
        </div>
      </div>
    </nav>
  );
};

export default FloatingNavbar;
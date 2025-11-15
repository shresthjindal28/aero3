"use client";
import React from "react";
import Image from "next/image";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";

const FloatingNavbar = () => {
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const { isSignedIn } = useUser();
  return (
    <nav className="fixed w-[70%] top-4 left-1/2 z-50 -translate-x-1/2">
      <div
        className="
        flex items-center justify-between gap-10
        rounded-full
        border border-white/10
        bg-black/20
        px-8 py-2
        shadow-lg
        backdrop-blur-xl
      "
      >
        {/* --- Logo --- */}
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* <div className="absolute -inset-1 bg-emerald-500/50 rounded-full blur-[20px] animate-pulse" /> */}
            <Image src="/logo.jpeg" alt="Pokemon" width={45} height={45} className="rounded-full" />
          </div>
          <div className="hidden text-xl font-bold sm:block special-text bg-linear-to-r from-emerald-400 via-white to-emerald-700 bg-clip-text text-transparent">
            Curamind
          </div>
        </div>

        {/* --- Nav Links with Hover Effect --- */}
        <div className="hidden items-center gap-6 md:flex">
          <Link
            href="#home"
            onClick={(e) => handleSmoothScroll(e, "home")}
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Home</span>
            <span className="absolute left-0 -bottom-1 w-full h-px bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </Link>
          <Link
            href="#about"
            onClick={(e) => handleSmoothScroll(e, "about")}
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>About</span>
            <span className="absolute left-0 -bottom-1 w-full h-px bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </Link>
          <Link
            href="#features"
            onClick={(e) => handleSmoothScroll(e, "features")}
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Features</span>
            <span className="absolute left-0 -bottom-1 w-full h-px bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </Link>
          <Link
            href="#pricing"
            onClick={(e) => handleSmoothScroll(e, "pricing")}
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Pricing</span>
            <span className="absolute left-0 -bottom-1 w-full h-px bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </Link>
          <Link
            href="#contact"
            onClick={(e) => handleSmoothScroll(e, "contact")}
            className="relative group text-gray-300 transition-colors hover:text-emerald-300"
          >
            <span>Contact</span>
            <span className="absolute left-0 -bottom-1 w-full h-px bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
          </Link>
        </div>

        {/* --- Auth / Dashboard --- */}
        <div className="hidden items-center gap-4 md:flex">
          {isSignedIn ? (
            <Button
              variant="outline"
              className="rounded-full border-emerald-500 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300"
            >
              <Link href="/dashboard">Dashboard</Link>
            </Button>
          ) : (
            <>
              <Link
                href="/signin"
                className="relative group text-gray-300 transition-colors hover:text-emerald-300"
              >
                <span>Login</span>
                <span className="absolute left-0 -bottom-1 w-full h-px bg-emerald-400 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center" />
              </Link>
              <Button
                variant="outline"
                className="rounded-full border-emerald-500 bg-emerald-500/10 text-emerald-400 transition-all hover:bg-emerald-500/20 hover:text-emerald-300"
              >
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
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

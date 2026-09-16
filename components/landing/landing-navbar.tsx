"use client";

import { useState } from "react";
import Link from "next/link";
import { GraduationCap, Menu, X, ArrowRight } from "lucide-react";

export function LandingNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { label: "Tổng quan", href: "#overview" },
    { label: "Quy trình 5 bước", href: "#how-it-works" },
    { label: "Tính năng", href: "#features" },
    { label: "Công nghệ AI", href: "#ai-spec" },
    { label: "Đội ngũ", href: "#team" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/90 backdrop-blur-2xl transition-all shadow-xs">
      {/* Chiều cao chuẩn 88px - 96px để navbar cao ráo, thoáng đãng, không bị bẹp */}
      <div className="mx-auto flex min-h-[88px] sm:min-h-[96px] w-full max-w-[1440px] items-center justify-between px-6 sm:px-8 lg:px-12 py-4">
        {/* Brand Logo */}
        <Link href="/" className="flex items-center gap-3.5 group">
          <span className="flex size-12 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-sm transition-transform group-hover:scale-105">
            <GraduationCap className="size-6" />
          </span>
          <div className="flex flex-col">
            <span className="text-xl sm:text-2xl font-black tracking-tight flex items-center gap-2 text-foreground">
              Joblingo
              <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary border border-primary/20">
                AI
              </span>
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden lg:flex items-center gap-2 rounded-full border border-border/80 bg-muted/40 p-2 shadow-xs">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-full px-5 py-2 text-sm font-semibold text-muted-foreground transition-all hover:bg-background hover:text-foreground hover:shadow-xs"
            >
              {link.label}
            </a>
          ))}
        </nav>

        {/* Action Buttons */}
        <div className="hidden sm:flex items-center gap-3.5">
          {/* Sign In Button Placeholder */}
          <button
            type="button"
            className="cursor-pointer rounded-full px-5 py-2.5 text-sm font-bold text-foreground transition-colors hover:bg-muted"
            onClick={() => alert("Chức năng Đăng nhập đang được kích hoạt...")}
          >
            Đăng nhập
          </button>

          {/* Sign Up / Try Free CTA Placeholder */}
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-md transition-all hover:scale-105 active:scale-95"
          >
            <span>Trải nghiệm ngay</span>
            <ArrowRight className="size-4" />
          </Link>
        </div>

        {/* Mobile Menu Toggle Button */}
        <div className="flex lg:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex size-11 items-center justify-center rounded-xl border border-border text-foreground hover:bg-muted"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-border bg-background p-6 lg:hidden shadow-xl animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-xl px-4 py-3 text-base font-semibold text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                {link.label}
              </a>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-border pt-4">
              <button
                type="button"
                className="w-full rounded-full border border-border py-3 text-center text-sm font-bold text-foreground hover:bg-muted"
                onClick={() => {
                  setMobileMenuOpen(false);
                  alert("Chức năng Đăng nhập đang được kích hoạt...");
                }}
              >
                Đăng nhập
              </button>
              <Link
                href="/home"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full rounded-full bg-primary py-3 text-center text-sm font-bold text-primary-foreground shadow-md"
              >
                Trải nghiệm ngay
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

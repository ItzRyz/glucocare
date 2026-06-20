"use client"; // Required for client-side interactions like opening the menu

import { SignInButton, SignUpButton } from "@clerk/nextjs";
import { Activity, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Sheet,
    SheetContent,
    SheetTrigger,
    SheetTitle
} from "@/components/ui/sheet";

const navLinks = [
    { name: "Home", href: "#home" },
    { name: "About", href: "#about" },
    { name: "Features", href: "#features" },
    { name: "Contact", href: "#contact" },
];

export function LandingNavbar() {
    return (
        <nav className="fixed top-5 z-50 w-full">
            <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 py-2 border border-primary/20 rounded-3xl bg-white/20 backdrop-blur-lg shadow-md">

                <div className="flex items-center gap-2">
                    <div className="rounded-xl bg-primary p-2 text-white shadow-md shadow-primary/20">
                        <Activity className="h-5 w-5" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        Gluco<span className="text-primary">Care</span>
                    </span>
                </div>

                <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
                    {navLinks.map((link) => (
                        <a
                            key={link.href}
                            href={link.href}
                            className="relative py-1 hover:text-primary transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                        >
                            {link.name}
                        </a>
                    ))}
                </div>

                <div className="hidden md:flex items-center gap-4">
                    <SignInButton mode="modal">
                        <Button variant="ghost" size="sm">Sign In</Button>
                    </SignInButton>
                    <SignUpButton mode="modal">
                        <Button size="sm">Sign Up</Button>
                    </SignUpButton>
                </div>

                <div className="flex md:hidden items-center gap-4">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="ghost" size="icon" className="text-slate-600">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Toggle menu</span>
                            </Button>
                        </SheetTrigger>

                        <SheetContent side="right" className="w-[300px] sm:w-[400px] flex flex-col justify-between px-8">
                            <div className="flex flex-col gap-6 mt-6">
                                <SheetTitle className="flex items-center gap-2 text-left">
                                    <Activity className="h-5 w-5 text-primary" />
                                    <span className="font-bold">GlucoCare</span>
                                </SheetTitle>

                                <div className="flex flex-col gap-4 text-lg font-medium text-slate-600 mt-4">
                                    {navLinks.map((link) => (
                                        <a
                                            key={link.href}
                                            href={link.href}
                                            className="hover:text-primary transition-colors py-2 border-b border-slate-100"
                                        >
                                            {link.name}
                                        </a>
                                    ))}
                                </div>
                            </div>

                            <div className="flex flex-col gap-3 pb-6">
                                <SignInButton mode="modal">
                                    <Button variant="outline" className="w-full">Sign In</Button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <Button className="w-full">Sign Up</Button>
                                </SignUpButton>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

            </div>
        </nav>
    );
}
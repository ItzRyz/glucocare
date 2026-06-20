"use client"

import { Activity } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const footerLinks = {
    product: [
        { name: "Features", href: "#features" },
        { name: "Integrations", href: "#" },
        { name: "Pricing", href: "#" },
        { name: "FAQ", href: "#" },
    ],
    company: [
        { name: "About Us", href: "#about" },
        { name: "Careers", href: "#" },
        { name: "Blog", href: "#" },
        { name: "Press", href: "#" },
    ],
    legal: [
        { name: "Privacy Policy", href: "#" },
        { name: "Terms of Service", href: "#" },
        { name: "HIPAA Compliance", href: "#" },
        { name: "Cookie Policy", href: "#" },
    ],
};

export function LandingFooter() {
    return (
        <footer className="w-full border-t border-slate-200/80 bg-slate-50 text-slate-600">
            <div className="container mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-16">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 xl:gap-12 pb-12 border-b border-slate-200">

                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="rounded-xl bg-primary p-2 text-white shadow-md shadow-primary/20">
                                <Activity className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight text-slate-900">
                                Gluco<span className="text-primary">Care</span>
                            </span>
                        </div>
                        <p className="text-sm text-slate-500 max-w-sm leading-relaxed">
                            Empowering individuals and healthcare institutions with smart, real-time diabetes tracking and clinical monitoring solutions.
                        </p>

                        <div className="flex items-center gap-5 text-slate-400">
                            <a href="#" aria-label="Twitter" className="hover:text-primary transition-colors">
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="GitHub" className="hover:text-primary transition-colors">
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="LinkedIn" className="hover:text-primary transition-colors">
                                <svg className="h-5 w-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                </svg>
                            </a>
                            <a href="#" aria-label="Instagram" className="hover:text-primary transition-colors">
                                <svg className="h-5 w-5 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                                </svg>
                            </a>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Product</h3>
                        <ul className="space-y-3 text-sm">
                            {footerLinks.product.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="hover:text-primary transition-colors">{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div>
                        <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase mb-4">Company</h3>
                        <ul className="space-y-3 text-sm">
                            {footerLinks.company.map((link) => (
                                <li key={link.name}>
                                    <a href={link.href} className="hover:text-primary transition-colors">{link.name}</a>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-sm font-semibold text-slate-900 tracking-wider uppercase">Stay Updated</h3>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            Subscribe to our newsletter for latest healthcare tips and product updates.
                        </p>
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2">
                            <Input
                                type="email"
                                placeholder="Enter your email"
                                className="bg-white border-slate-200 max-w-xs focus-visible:ring-primary"
                                required
                            />
                            <Button type="submit" size="sm" className="sm:w-auto w-max">
                                Subscribe
                            </Button>
                        </form>
                    </div>

                </div>

                <div className="pt-8 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                    <p>© {new Date().getFullYear()} GlucoCare Inc. All rights reserved.</p>
                    <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
                        {footerLinks.legal.map((link) => (
                            <a key={link.name} href={link.href} className="hover:text-primary transition-colors">
                                {link.name}
                            </a>
                        ))}
                    </div>
                </div>

            </div>
        </footer>
    );
}
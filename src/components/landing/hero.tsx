"use client";

import { Sparkles, ArrowRight, ArrowUpRight } from "lucide-react";
import { motion, Variants } from "framer-motion";

export function LandingHero() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15,
            },
        },
    };

    return (
        <section className="relative overflow-hidden" id="home">
            <div className="absolute inset-0 bg-linear-to-br from-cyan-500/40 via-transparent to-transparent" />
            <div className="container relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col justify-center">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                    <motion.div
                        className="lg:col-span-7 flex flex-col justify-center text-center lg:text-left"
                        variants={containerVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div variants={itemVariants} className="inline-flex self-center lg:self-start items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary mb-6 border border-primary/50">
                            <Sparkles className="h-4 w-4" />
                            <span>Self-Diagnosis and Diabetes Monitoring System</span>
                        </motion.div>
                        <motion.h1 variants={itemVariants} className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl md:text-6xl lg:leading-[1.15]">
                            Smart <span className="bg-linear-to-r from-primary to-cyan-500 bg-clip-text text-transparent">Diabetes Screening</span> & Integrated Telemedicine
                        </motion.h1>
                        <motion.p variants={itemVariants} className="mt-6 text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0">
                            GlucoCare connects patients, doctors, and admins in one Machine Learning-based ecosystem for early, accurate, and responsive diabetes risk diagnosis.
                        </motion.p>
                        <motion.div variants={itemVariants} className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button className="inline-flex items-center justify-center rounded-xl px-6 py-3.5 text-base font-semibold bg-transparent text-primary border border-primary hover:bg-primary hover:text-white transition-all transform hover:-translate-y-0.5">
                                Learn more
                            </button>
                            <button className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-base font-semibold bg-primary text-white border border-primary hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/30 transform hover:-translate-y-0.5">
                                Get Started
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="lg:col-span-5 relative mt-10 lg:mt-0"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                    >
                        <motion.div
                            className="relative mx-auto max-w-[360px] sm:max-w-[400px] rounded-2xl bg-white p-6 shadow-2xl border border-slate-100"
                            whileHover={{ y: -5 }}
                            transition={{ type: "spring", stiffness: 300 }}
                        >
                            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-rose-50 flex items-center justify-center text-rose-600 font-bold border border-rose-100">
                                        ML
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-semibold text-slate-900">GlucoCare AI</h4>
                                        <p className="text-xs text-slate-500">High accuracy diagnose</p>
                                    </div>
                                </div>
                                <span className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-xs font-semibold text-rose-700 border border-rose-100 animate-pulse">
                                    High Risk
                                </span>
                            </div>

                            {/* Visual Indikator */}
                            <div className="space-y-3">
                                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                                    <span className="text-xs font-medium text-slate-500 block">Blood Sugar Level</span>
                                    <span className="text-lg font-bold text-slate-900">185 mg/dL</span>
                                </div>
                                <div className="p-3 bg-red-50/50 rounded-lg border border-red-100">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <span className="text-xs font-bold text-red-800 block">Fast Recomendation</span>
                                            <p className="text-xs text-red-700 mt-0.5">High risk detected. Please consult a doctor immediately.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Instant Match Card */}
                            <motion.div
                                className="mt-4 p-3 bg-primary/20 rounded-xl border border-primary/40 flex items-center justify-between"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="flex items-center gap-2">
                                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                                        Dr
                                    </div>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900">dr. Salim Wijaya, Sp.PD</p>
                                        <p className="text-[10px] text-primary font-medium">Available Now (Instant Match)</p>
                                    </div>
                                </div>
                                <button className="p-1.5 bg-white rounded-lg border border-primary/20 text-primary hover:bg-primary/10 transition-colors">
                                    <ArrowUpRight className="h-4 w-4" />
                                </button>
                            </motion.div>
                        </motion.div>
                    </motion.div>

                </div>
            </div>
        </section>
    );
}
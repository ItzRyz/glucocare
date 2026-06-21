"use client";

import { motion, Variants } from "framer-motion";
import { Activity, ShieldCheck, Stethoscope } from "lucide-react";

export function LandingAbout() {
    const containerVariants: Variants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.2,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants: Variants = {
        hidden: { opacity: 0, y: 30 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                type: "spring",
                stiffness: 80,
                damping: 20,
            },
        },
    };

    return (
        <section id="about" className="relative py-24 overflow-hidden bg-slate-50">
            {/* Subtle background decoration */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-80 h-80 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
                <motion.div 
                    className="text-center max-w-3xl mx-auto mb-16"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.6 }}
                >
                    <h2 className="text-sm font-bold tracking-widest text-primary uppercase mb-3">About GlucoCare</h2>
                    <h3 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-6">
                        Bridging the gap between <span className="text-primary">technology</span> and <span className="text-cyan-500">healthcare</span>
                    </h3>
                    <p className="text-lg text-slate-600 leading-relaxed">
                        GlucoCare is a state-of-the-art diabetes management platform designed to empower patients, streamline clinical workflows for doctors, and provide actionable insights through advanced Machine Learning. We believe that proactive health monitoring is the key to a better life.
                    </p>
                </motion.div>

                <motion.div 
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                    variants={containerVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true, margin: "-100px" }}
                >
                    {/* Pillar 1 */}
                    <motion.div 
                        variants={itemVariants} 
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-14 h-14 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-6">
                            <Activity className="w-7 h-7" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Early Detection</h4>
                        <p className="text-slate-600 leading-relaxed">
                            Utilizing predictive Machine Learning models (Random Forest & Logistic Regression) to assess diabetes risk accurately from your health data before complications arise.
                        </p>
                    </motion.div>

                    {/* Pillar 2 */}
                    <motion.div 
                        variants={itemVariants} 
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-14 h-14 bg-cyan-50 text-cyan-600 rounded-2xl flex items-center justify-center mb-6">
                            <Stethoscope className="w-7 h-7" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Integrated Telemedicine</h4>
                        <p className="text-slate-600 leading-relaxed">
                            Connect instantly with healthcare professionals. Our platform seamlessly shares your diagnostic data with your doctor for immediate and informed consultations.
                        </p>
                    </motion.div>

                    {/* Pillar 3 */}
                    <motion.div 
                        variants={itemVariants} 
                        className="bg-white rounded-3xl p-8 shadow-xl shadow-slate-200/50 border border-slate-100 hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
                    >
                        <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                            <ShieldCheck className="w-7 h-7" />
                        </div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Secure & Compliant</h4>
                        <p className="text-slate-600 leading-relaxed">
                            Built with a robust Role-Based Access Control (RBAC) system. Your sensitive medical records are protected, ensuring privacy and compliance at every step.
                        </p>
                    </motion.div>
                </motion.div>
            </div>
        </section>
    );
}

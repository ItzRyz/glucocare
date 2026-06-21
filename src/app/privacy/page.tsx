import { Shield, Clock } from "lucide-react";

export default function PrivacyPolicyPage() {
    return (
        <main className="min-h-screen bg-background text-foreground py-16 sm:py-24 px-4">
            <div className="max-w-3xl mx-auto space-y-8">

                <div className="space-y-4 border-b border-border pb-8">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                        <Shield className="w-4 h-4" /> Legal Framework
                    </div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                        Privacy Policy
                    </h1>
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                        <Clock className="w-4 h-4" />
                        <span>Last Updated: June 20, 2026</span>
                    </div>
                </div>

                <div className="prose prose-invert max-w-none space-y-6 text-base leading-relaxed text-foreground">
                    <p>
                        At <strong>GlucoCare</strong>, we are committed to protecting your personal health information and privacy. This Privacy Policy outlines how we collect, use, disclose, and safeguard your data when you use our application and landing platform.
                    </p>

                    <h2 className="text-2xl font-bold text-foreground mt-8">1. Information We Collect</h2>
                    <p>We collect information that you provide directly to us, including:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li><strong>Account Details:</strong> Name, email address, password, and authentication metadata provided through Clerk.</li>
                        <li><strong>Health Data:</strong> Blood glucose logs, dietary intake inputs, activity levels, and clinical context tracking configurations.</li>
                        <li><strong>Technical Data:</strong> IP address, device telemetry, browser type, and usage statistics collected via Vercel Analytics.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-8">2. How We Use Your Information</h2>
                    <p>We process your data to provide, optimize, and maintain GlucoCare services. Specifically to:</p>
                    <ul className="list-disc pl-6 space-y-2">
                        <li>Generate real-time diabetic health tracking insights.</li>
                        <li>Facilitate clinical sharing configurations between patients and authorized medical professionals.</li>
                        <li>Monitor application uptime, safety, and combat unauthorized access attempts.</li>
                    </ul>

                    <h2 className="text-2xl font-bold text-foreground mt-8">3. Data Retention and Deletion</h2>
                    <p>
                        Your account credentials and tracking indices remain secure in our PostgreSQL infrastructure managed via Prisma. You hold full ownership of your data and can request absolute deletion of your health metrics at any time directly from your account configuration panel.
                    </p>
                </div>
            </div>
        </main>
    );
}
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
    CardContent
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Mail,
    Phone,
    MapPin,
    ArrowRight
} from "lucide-react";

const contactMethods = [
    {
        title: "Email Us",
        description: "Our team is here to help with technical or account queries.",
        contact: "support@glucocare.com",
        href: "mailto:support@glucocare.com",
        icon: Mail,
        actionText: "Send an email"
    },
    {
        title: "Call Us",
        description: "Mon-Fri from 8am to 5pm for urgent medical institution inquiries.",
        contact: "+1 (555) 000-0000",
        href: "tel:+15550000000",
        icon: Phone,
        actionText: "Call support"
    },
    {
        title: "Visit Our HQ",
        description: "Come say hello at our main office and engineering hub.",
        contact: "123 Health Tech Way, San Francisco, CA",
        href: "https://maps.google.com",
        icon: MapPin,
        actionText: "Get directions"
    },
];

export function LandingContact() {
    return (
        <section id="contact" className="container mx-auto py-24 sm:py-32 space-y-16 px-4 max-w-7xl">

            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900">
                    Get in touch with us
                </h2>
                <p className="text-muted-foreground text-lg">
                    Have questions about GlucoCare? We're here to help you optimize your patient care and health tracking.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                {contactMethods.map((method, index) => {
                    const Icon = method.icon;
                    return (
                        <Card
                            key={index}
                            className="relative overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-slate-200/60"
                        >
                            <CardHeader className="space-y-4">
                                <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-inner">
                                    <Icon className="w-6 h-6" />
                                </div>

                                <div className="space-y-2">
                                    <CardTitle className="text-xl font-bold text-slate-900">
                                        {method.title}
                                    </CardTitle>
                                    <CardDescription className="text-slate-500 leading-relaxed min-h-[48px]">
                                        {method.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent className="space-y-4 pt-0">
                                <p className="font-semibold text-slate-800 break-all">
                                    {method.contact}
                                </p>
                                <a
                                    href={method.href}
                                    target={method.href.startsWith("http") ? "_blank" : undefined}
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline group/btn"
                                >
                                    {method.actionText}
                                    <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover/btn:translate-x-1" />
                                </a>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            <div className="max-w-4xl mx-auto bg-slate-50 border border-slate-100 rounded-3xl p-8 sm:p-12 text-center space-y-6">
                <h3 className="text-2xl font-bold text-slate-900">Looking for custom enterprise solutions?</h3>
                <p className="text-slate-600 max-w-xl mx-auto">
                    Connect with our clinical integration team to set up customized APIs for your hospital or health system.
                </p>
                <Button size="lg" className="shadow-lg shadow-primary/20">
                    Contact Sales Team
                </Button>
            </div>

        </section>
    );
}
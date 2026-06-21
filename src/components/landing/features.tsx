import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import {
    Zap,
    Shield,
    BarChart3,
    Sparkles,
    Gauge,
    Globe
} from "lucide-react";

interface FeatureProps {
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
}

const features: FeatureProps[] = [
    {
        title: "Easy to use",
        description: "Simple and intuitive interface for easy health management.",
        icon: Zap,
    },
    {
        title: "High Accuracy",
        description: "Track your health with highly accurate data tracking for more reliable health management.",
        icon: Shield,
    },
    {
        title: "Real-time Tracking",
        description: "Track your health in real-time with easy-to-read data visualizations.",
        icon: BarChart3,
    },
    {
        title: "AI Powered Insights",
        description: "Leverage AI to get personalized insights and recommendations for managing your diabetes.",
        icon: Sparkles,
    },
    {
        title: "Trusted by Users",
        description: "Join thousands of satisfied users who trust our platform for their health management needs.",
        icon: Gauge,
    },
    {
        title: "Connect with Doctors",
        description: "Get connected with healthcare professionals for personalized guidance and support.",
        icon: Globe,
    },
];

export function LandingFeatures() {
    return (
        <section className="container mx-auto py-24 sm:py-32 space-y-12" id="features">
            <div className="text-center space-y-4 max-w-2xl mx-auto">
                <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
                    Everything you need to live healthier
                </h2>
                <p className="text-muted-foreground text-lg">
                    Manage your diabetes with ease. Track your glucose levels, get personalized insights, and connect with healthcare professionals.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto px-4">
                {features.map((feature, index) => {
                    const Icon = feature.icon;
                    return (
                        <Card
                            key={index}
                            className="transition-all duration-200 hover:border-primary/50 hover:shadow-md group"
                        >
                            <CardHeader className="space-y-4">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-200">
                                    <Icon className="w-5 h-5" />
                                </div>
                                <div className="space-y-2">
                                    <CardTitle className="text-xl font-semibold">
                                        {feature.title}
                                    </CardTitle>
                                    <CardDescription className="text-muted-foreground leading-relaxed">
                                        {feature.description}
                                    </CardDescription>
                                </div>
                            </CardHeader>
                        </Card>
                    );
                })}
            </div>
        </section>
    );
}
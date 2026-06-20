import { LandingContact } from "@/components/landing/contact";
import { LandingFeatures } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { LandingNavbar } from "@/components/landing/navbar";

export default function Home() {
    return (
        <main className="bg-background">
            <LandingNavbar />
            <LandingHero />
            <LandingFeatures />
            <LandingContact />
            <LandingFooter />
        </main>
    );
}
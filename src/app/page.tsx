import { LandingContact } from "@/components/landing/contact";
import { LandingFeatures } from "@/components/landing/features";
import { LandingFooter } from "@/components/landing/footer";
import { LandingHero } from "@/components/landing/hero";
import { LandingNavbar } from "@/components/landing/navbar";
import { LandingAbout } from "@/components/landing/about";

export default function Home() {
    return (
        <main className="bg-background">
            <LandingNavbar />
            <LandingHero />
            <LandingAbout />
            <LandingFeatures />
            <LandingContact />
            <LandingFooter />
        </main>
    );
}
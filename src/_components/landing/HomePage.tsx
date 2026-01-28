import { Navbar } from "../layout/Navbar";
import { Footer } from "../layout/Footer";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { CompetitionsSection } from "./CompetitionsSection";
import { TestimonialsSection } from "./TestimonialsSection";
import { FAQSection } from "./FAQSection";

export const HomePage = () => {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
            <CompetitionsSection />
            <TestimonialsSection />
            <FAQSection />
            <Footer />
        </main>
    );
};

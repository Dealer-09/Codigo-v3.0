import { Navbar } from "../layout/Navbar";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";

export const HomePage = () => {
    return (
        <main className="min-h-screen bg-[#0a0a0a] text-white selection:bg-purple-500/30">
            <Navbar />
            <HeroSection />
            <FeaturesSection />
        </main>
    );
};

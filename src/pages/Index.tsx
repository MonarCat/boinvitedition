import { useEffect } from "react";
import { ensureAuthButtonsVisible } from "@/utils/buttonVisibility";
import ModernNavigation from "@/components/modern/ModernNavigation";
import ModernHeroSection from "@/components/modern/ModernHeroSection";
import ModernBusinessTypeCards from "@/components/modern/ModernBusinessTypeCards";

const Index = () => {
  // Ensure auth buttons visibility
  useEffect(() => {
    ensureAuthButtonsVisible();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <ModernNavigation />
      <ModernHeroSection />
      <ModernBusinessTypeCards />
    </div>
  );
};

export default Index;
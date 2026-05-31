import Navbar from "@/components/Navbar";
import HeroSlider from "@/components/HeroSlider";
import ServicesGrid from "@/components/ServicesGrid";
import CompanyOverview from "@/components/CompanyOverview";
import InternationalBanner from "@/components/InternationalBanner";
import PromiseSection from "@/components/PromiseSection";
import WhyChooseUs from "@/components/WhyChooseUs";
import Reviews from "@/components/Reviews";
import CompanyBenefits from "@/components/CompanyBenefits";
import Footer from "@/components/Footer";
import StickyTrackingBar from "@/components/StickyTrackingBar";
import { useDocumentMeta } from "@/hooks/useDocumentMeta";

export default function LandingPage() {
  useDocumentMeta(
    "Tranzex Route Logistics — Global Freight & Cargo Delivery",
    "Reliable courier and freight forwarding. Ocean, air & road freight with real-time tracking. Door-to-door delivery worldwide."
  );
  return (
    <>
      <Navbar />
      <main>
        <HeroSlider />
        <ServicesGrid />
        <CompanyOverview />
        <InternationalBanner />
        <PromiseSection />
        <WhyChooseUs />
        <Reviews />
        <CompanyBenefits />
      </main>
      <Footer />
      <StickyTrackingBar />
    </>
  );
}

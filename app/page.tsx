import FeaturesSection from "@/components/landingPageComponets/features-ten";
import Footer from "@/components/landingPageComponets/footer";
import FloatingNavbar from "@/components/landingPageComponets/Nabvar";
import Pricing from "@/components/landingPageComponets/pricing";
import About from "@/components/landingPageComponets/About";
import ContactSection from "@/components/landingPageComponets/Contact";
import HeroPage from "@/components/landingPageComponets/HeroPage";

const page = () => {
  return <div className="min-h-screen">
    <FloatingNavbar />
    <HeroPage />
    <About />
    <FeaturesSection />
    <Pricing />
    <ContactSection />
    <Footer />
  </div>;
};

export default page;

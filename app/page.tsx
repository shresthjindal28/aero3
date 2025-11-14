import FeaturesSection from "@/components/features-ten";
import Footer from "@/components/footer";
import FloatingNavbar from "@/components/Nabvar";
import Pricing from "@/components/pricing";
import About from "@/section/About";
import ContactSection from "@/section/Contact";
import HeroPage from "@/section/HeroPage";

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

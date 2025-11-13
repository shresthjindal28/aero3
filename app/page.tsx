// Removed client directive
import { LoaderGate } from "@/components/Loader";
import Navbar from "@/components/Navbar";
import SiriOrb from "@/components/smoothui/siri-orb";
import {ModernHero} from "@/sections/HeroSection";

function Page() {
  return (
    <div>
      <LoaderGate>
        <Navbar/>
        <ModernHero />
        <SiriOrb />
      </LoaderGate>
    </div>
  );
}

export default Page;

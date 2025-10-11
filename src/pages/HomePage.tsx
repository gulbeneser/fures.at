import { Hero } from "../components/Hero";
import { WhyUs } from "../components/WhyUs";
import { Mission } from "../components/Mission";
import { Services } from "../components/Services";
import { ServicePackages } from "../components/ServicePackages";
import { Quote } from "../components/Quote";
import { About } from "../components/About";

export function HomePage() {
  return (
    <>
      <Hero />
      <WhyUs />
      <Mission />
      <Services />
      <ServicePackages />
      <Quote />
      <About />
    </>
  );
}

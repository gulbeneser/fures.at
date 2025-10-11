import { About } from "../components/About";
import { Mission } from "../components/Mission";
import { WhyUs } from "../components/WhyUs";

export function AboutPage() {
  return (
    <div className="pt-16">
      <About />
      <Mission />
      <WhyUs />
    </div>
  );
}

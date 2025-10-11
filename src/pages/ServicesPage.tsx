import { Services } from "../components/Services";
import { ServicePackages } from "../components/ServicePackages";

export function ServicesPage() {
  return (
    <div className="pt-16">
      <Services />
      <ServicePackages />
    </div>
  );
}

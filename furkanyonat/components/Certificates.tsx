import React from 'react';
import AnimatedSection from './AnimatedSection';
import CertificateCard from './ui/CertificateCard';

interface CertificatesProps {
  t: any;
  onCertificateSelect: (cert: any) => void;
}

const Certificates: React.FC<CertificatesProps> = ({ t, onCertificateSelect }) => {
  return (
    <AnimatedSection id="certificates">
      <h2 className="text-2xl font-bold text-primary-text mb-6">{t.certificates.title}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {t.certificates.items.map((cert: any) => (
          <CertificateCard 
            key={cert.name} 
            cert={cert} 
            onClick={() => onCertificateSelect(cert)} 
          />
        ))}
      </div>
    </AnimatedSection>
  );
};

export default Certificates;

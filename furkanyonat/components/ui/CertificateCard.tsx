import React from 'react';

const getCertificateIcon = (type?: string) => {
    switch (type) {
      case 'hubspot': return <svg className="w-full h-full text-orange-500" role="img" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg"><path fill="currentColor" d="M23.99 48C10.74 48 0 37.26 0 24.01 0 10.76 10.74 0 23.99 0s24.01 10.74 24.01 23.99c0 13.25-10.76 24.01-24.01 24.01zm0-4.87c10.59 0 19.16-8.57 19.16-19.14S34.58 4.85 23.99 4.85 4.83 13.42 4.83 24s8.57 19.13 19.16 19.13zm-1.89-10.15c.61-.41 1.04-.63 1.34-.63.49 0 .91.36 1.09.91.01.07.01.15.01.23v5.63h4.86V21.84h-4.86v5.27c0 .91-.3 1.34-1.12 1.34-.49 0-.85-.16-1.15-.46l-.37-.36v-6.15h-4.86v9.85h4.86v-3.79zM20.25 15.6h-5.02v14.45h5.02V15.6zm13.11 0c-3.1 0-5.32 1.73-5.32 5.09s2.22 5.14 5.32 5.14c1.78 0 3.2-1 3.7-2.31h.08v1.94h4.78V15.6h-4.78v1.94h-.08c-.5-1.31-1.92-2.31-3.7-2.31zm.07 7.91c-1.63 0-2.61-1.07-2.61-2.8s.98-2.78 2.61-2.78c1.6 0 2.56.98 2.56 2.78s-.96 2.8-2.56 2.8z"></path></svg>;
      case 'google': return <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M21.35,11.1H12.18V13.83H18.67C18.36,17.64 15.19,19.27 12.19,19.27C8.36,19.27 5,16.25 5,12C5,7.9 8.2,4.73 12.19,4.73C14.76,4.73 16.04,5.78 17.02,6.72L19.33,4.53C17.23,2.72 14.91,1.73 12.19,1.73C6.94,1.73 3,6.36 3,12C3,17.64 7.03,22.27 12.19,22.27C17.6,22.27 21.5,18.33 21.5,11.33C21.5,10.43 21.45,10.84 21.35,11.1Z"></path></svg>;
      case 'saylor': return <svg className="w-6 h-6 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422A12.083 12.083 0 0121 18.734V19a2 2 0 01-2 2H5a2 2 0 01-2-2v-.266A12.083 12.083 0 016.84 10.578L12 14z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l-9 5 9 5 9-5-9-5z" /></svg>;
      case 'hospitality': return <svg className="w-6 h-6 text-teal-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>;
      case 'programming': return <svg className="w-6 h-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>;
      default: return <svg className="w-6 h-6 text-slate-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
    }
};

interface CertificateCardProps {
    cert: any;
    onClick: () => void;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ cert, onClick }) => (
    <button onClick={onClick} className="w-full text-left glass-card p-4 rounded-xl transition-all duration-300 transform hover:-translate-y-1 hover:border-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
        <div className="flex items-center space-x-4">
            <div className="flex-shrink-0 h-10 flex items-center justify-center w-10 bg-black/20 rounded-lg">{getCertificateIcon(cert.type)}</div>
            <div className="flex-1">
                <p className="font-semibold text-primary-text leading-tight">{cert.name}</p>
                <p className="text-sm text-secondary-text mt-1">{cert.issuer}</p>
            </div>
        </div>
    </button>
);

export default CertificateCard;
import React from 'react';
import Counter from '../components/Counter';
import AnimatedSection from '../components/AnimatedSection';

const KpiSection = ({ t }: { t: any }) => (
    <AnimatedSection>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-center">
            {Object.entries(t.kpis).map(([key, value]) => (
                <Counter key={key} endValue={String(value)} description={t.kpis_full[key as keyof typeof t.kpis_full]} />
            ))}
        </div>
    </AnimatedSection>
);

export default KpiSection;

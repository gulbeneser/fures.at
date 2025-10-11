import { ExternalLink } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import gulbenPhoto from 'figma:asset/89ed099df0cc4adb7445b8f01f8bc8fb62629da4.png';
import furkanPhoto from 'figma:asset/19568e07e47e6fc2e6eca7bfa87487c1e1c9be6b.png';

export function Team() {
  const { t } = useLanguage();
  
  const team = [
    {
      name: t('team.gulben.name'),
      role: t('team.gulben.role'),
      description: t('team.gulben.description'),
      portfolio: "fures.at/gulbeneser",
      image: gulbenPhoto
    },
    {
      name: t('team.furkan.name'),
      role: t('team.furkan.role'),
      description: t('team.furkan.description'),
      portfolio: "fures.at/furkanyonat",
      image: furkanPhoto
    }
  ];

  return (
    <section className="py-32 relative overflow-hidden bg-black">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-purple-950/20 to-black"></div>
      
      {/* Floating Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl animate-pulse delay-700"></div>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl sm:text-5xl lg:text-6xl mb-6">
            <span className="bg-gradient-to-r from-white via-gray-100 to-white bg-clip-text text-transparent">
              {t('team.title')}
            </span>
          </h2>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 max-w-5xl mx-auto">
          {team.map((member, index) => (
            <div 
              key={index}
              className="group relative animate-in fade-in slide-in-from-bottom-8 duration-700"
              style={{
                animationDelay: `${index * 200}ms`,
                animationFillMode: 'both'
              }}
            >
              {/* Card */}
              <div className="relative p-8 lg:p-10 rounded-3xl bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-orange-500/50 transition-all duration-500 hover:transform hover:scale-[1.02] backdrop-blur-sm">
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-orange-500/0 via-purple-600/0 to-orange-500/0 rounded-3xl opacity-0 group-hover:opacity-100 group-hover:from-orange-500/10 group-hover:via-purple-600/5 group-hover:to-orange-500/10 transition-opacity duration-500 blur-xl"></div>
                
                <div className="relative z-10">
                  {/* Image */}
                  <div className="mb-6 relative">
                    <div className="w-32 h-32 lg:w-40 lg:h-40 mx-auto lg:mx-0 rounded-2xl overflow-hidden border-2 border-gradient-to-br from-orange-500/50 to-purple-600/50 group-hover:border-orange-400 transition-all duration-500 shadow-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500/20 to-purple-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <img
                        src={member.image}
                        alt={member.name}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                      />
                    </div>
                  </div>
                  
                  <div className="text-center lg:text-left">
                    {/* Name */}
                    <h3 className="text-2xl lg:text-3xl mb-2 text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-orange-400 group-hover:to-purple-400 group-hover:bg-clip-text transition-all duration-300">
                      {member.name}
                    </h3>
                    
                    {/* Role */}
                    <p className="text-orange-400 mb-4 tracking-wide">
                      {member.role}
                    </p>
                    
                    {/* Description */}
                    <p className="text-gray-300 leading-relaxed mb-6 text-sm lg:text-base">
                      {member.description}
                    </p>
                    
                    {/* Portfolio Link */}
                    <a 
                      href={`https://${member.portfolio}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-orange-400 transition-colors group/link"
                    >
                      <span className="border-b border-gray-600 group-hover/link:border-orange-400 transition-colors">
                        CV & Portfolio
                      </span>
                      <ExternalLink className="w-4 h-4 transform group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

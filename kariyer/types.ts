export interface PersonalInfo {
  name: string;
  email: string;
  phone: string;
  address: string;
  linkedin: string;
  website: string;
  profilePhoto: string; // Base64 encoded image string
}

export interface Experience {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  description: string;
}

export interface Education {
  id: string;
  degree: string;
  school: string;
  location:string;
  gradDate: string;
}

export interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: string[];
}

export interface DesignOptions {
    colorScheme: 'Professional Blue' | 'Modern Dark' | 'Elegant Green' | 'Minimalist Gray';
    fontStyle: 'Sans Serif' | 'Serif' | 'Modern';
}

// src/lib/schema-types.ts
// Based on your schema-for-backend.md (SQL version)

export type SiteSettingsSQL = {
  id: string; 
  hospitalName: string;
  logoUrl?: string | null;
  facebookUrl?: string | null;
  tiktokUrl?: string | null;
  telegramUrl?: string | null;
  created_at?: string; 
};

export type HeroSlideSQL = {
  id: string;
  src: string;
  alt: string;
  hint?: string | null;
  title?: string | null;
  subtitle?: string | null;
  ctaLink?: string | null;
  ctaText?: string | null;
  position?: number | null;
  created_at?: string;
};

export type AboutContentSQL = {
  id: string; 
  title: string;
  description: string;
  mission: string;
  vision: string;
  imageUrl?: string | null;
  imageHint?: string | null;
  created_at?: string;
};

export type ServiceSQL = {
  id: string;
  name: string;
  description: string; 
  detailedDescription: string; 
  iconName: string;
  created_at?: string;
};

export type FacilitySQL = {
  id: string;
  name: string;
  description: string;
  iconName: string;
  imageUrl?: string | null;
  imageHint?: string | null;
  detailedDescription: string;
  created_at?: string;
};

export type DepartmentSQL = {
  id: string;
  name: string;
  description: string;
  iconName: string;
  detailedDescription: string;
  headOfDepartmentImage?: string | null;
  headOfDepartmentImageHint?: string | null;
  created_at?: string;
};

export type GalleryItemSQL = {
  id: string;
  type: 'photo' | 'video';
  src: string;
  alt: string;
  hint?: string | null;
  position?: number | null;
  created_at?: string;
};

export type NewsEventSQL = {
  id: string;
  title: string;
  date: string; // Should be YYYY-MM-DD string for SQL DATE type
  summary: string;
  fullContent: string;
  image: string; // URL
  link: string; 
  hint?: string | null;
  created_at?: string;
};

export type ContactInfoSQL = {
  id: string; 
  address: string;
  phone: string;
  email: string;
  mapPlaceholder?: string | null; 
  created_at?: string;
};

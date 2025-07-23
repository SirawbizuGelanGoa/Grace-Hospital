import { AboutContent, Department, Facility, GalleryItem, HeroSlide, NewsEvent, Service } from './schema-types';
import * as mockData from './mock-data';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

async function fetchData(endpoint: string, mockFunction: () => any) {
  console.log('API_URL:', API_URL);
  if (!API_URL) {
    return mockFunction();
  }
  try {
    const response = await fetch(`${API_URL}${endpoint}`);
    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint}`);
      return mockFunction();
    }
    return response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return mockFunction();
  }
}

export const getAboutContent = async (): Promise<AboutContent | null> => {
  return fetchData('/api/about-content', mockData.getAboutContent);
};

export const getDepartments = async (): Promise<Department[]> => {
  return fetchData('/api/departments', mockData.getDepartments);
};

export const getFacilities = async (): Promise<Facility[]> => {
  return fetchData('/api/facilities', mockData.getFacilities);
};

export const getGalleryItems = async (): Promise<GalleryItem[]> => {
  return fetchData('/api/gallery-items', mockData.getGalleryItems);
};

export const getHeroSlides = async (): Promise<HeroSlide[]> => {
  return fetchData('/api/hero-slides', mockData.getHeroSlides);
};

export const getNewsEvents = async (): Promise<NewsEvent[]> => {
  return fetchData('/api/news-events', mockData.getNewsEvents);
};

export const getServices = async (): Promise<Service[]> => {
  return fetchData('/api/services', mockData.getServices);
};

import { AboutContent, Department, Facility, GalleryItem, HeroSlide, NewsEvent, Service } from './schema-types';
import * as mockData from './mock-data';

// Get the base URL for API calls
const getBaseUrl = () => {
  // In production, use the environment variable or current origin
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }

  // For server-side rendering, use environment variables
  return process.env.NEXT_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
};

async function fetchData(endpoint: string, mockFunction: () => any, options: RequestInit = {}) {
  const baseUrl = getBaseUrl();
  console.log('Fetching from:', `${baseUrl}${endpoint}`);

  try {
    const response = await fetch(`${baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch ${endpoint}: ${response.status} ${response.statusText}`);
      // Only fall back to mock data in development
      if (process.env.NODE_ENV === 'development') {
        return mockFunction();
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    // Only fall back to mock data in development
    if (process.env.NODE_ENV === 'development') {
      return mockFunction();
    }
    throw error;
  }
}

export const getAboutContent = async (): Promise<AboutContent | null> => {
  return fetchData('/api/about-content', mockData.getAboutContent, {
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['about-content']
    }
  });
};

export const getDepartments = async (): Promise<Department[]> => {
  return fetchData('/api/departments', mockData.getDepartments, {
    next: {
      revalidate: 60,
      tags: ['departments']
    }
  });
};

export const getFacilities = async (): Promise<Facility[]> => {
  return fetchData('/api/facilities', mockData.getFacilities, {
    next: {
      revalidate: 60,
      tags: ['facilities']
    }
  });
};

export async function getGalleryItems(): Promise<GalleryItem[]> {
  return fetchData('/api/gallery-items', mockData.getGalleryItems, {
    next: {
      revalidate: 60, // Revalidate every 60 seconds
      tags: ['gallery-items']
    }
  });
}

export const getHeroSlides = async (): Promise<HeroSlide[]> => {
  return fetchData('/api/hero-slides', mockData.getHeroSlides, {
    next: {
      revalidate: 60,
      tags: ['hero-slides']
    }
  });
};

export const getNewsEvents = async (): Promise<NewsEvent[]> => {
  return fetchData('/api/news-events', mockData.getNewsEvents, {
    next: {
      revalidate: 60,
      tags: ['news-events']
    }
  });
};

export const getServices = async (): Promise<Service[]> => {
  return fetchData('/api/services', mockData.getServices, {
    next: {
      revalidate: 60,
      tags: ['services']
    }
  });
};

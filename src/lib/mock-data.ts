// This file now acts as an API client layer, fetching data from Next.js API routes
// which in turn interact with the MySQL database.

import type {
    SiteSettingsSQL,
    HeroSlideSQL,
    AboutContentSQL,
    ServiceSQL,
    FacilitySQL,
    DepartmentSQL,
    GalleryItemSQL,
    NewsEventSQL,
    ContactInfoSQL
} from './schema-types';

// Re-export types for convenience elsewhere in the app
export type {
    SiteSettingsSQL,
    HeroSlideSQL,
    AboutContentSQL,
    ServiceSQL,
    FacilitySQL,
    DepartmentSQL,
    GalleryItemSQL,
    NewsEventSQL,
    ContactInfoSQL
};
// Renaming SQL suffixed types to simpler names for frontend use
export type SiteSettings = SiteSettingsSQL;
export type HeroSlide = HeroSlideSQL;
export type AboutContent = AboutContentSQL;
export type Service = ServiceSQL;
export type Facility = FacilitySQL;
export type Department = DepartmentSQL;
export type GalleryItem = GalleryItemSQL;
export type NewsEvent = NewsEventSQL;
export type ContactInfo = ContactInfoSQL;

// Admin authentication
export interface AdminCredentials {
    username: string;
    password: string;
}

// Custom logger to avoid Next.js console.error issues
const logger = {
    error: (message: string, ...args: any[]) => {
        // In development, still log to console but use console.warn instead of console.error
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[ERROR] ${message}`, ...args);
        }
        // In production, you could implement a more sophisticated logging solution
        // or simply suppress the errors that are expected
    },
    warn: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.warn(`[WARN] ${message}`, ...args);
        }
    },
    info: (message: string, ...args: any[]) => {
        if (process.env.NODE_ENV !== 'production') {
            console.info(`[INFO] ${message}`, ...args);
        }
    }
};

// --- Helper for API calls ---
// Define a custom error type to distinguish API errors
class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
    }
}

async function apiFetch<T>(url: string, options: RequestInit = {}): Promise<T> {
    const defaultOptions: RequestInit = {
        headers: {
            'Content-Type': 'application/json',
        },
        cache: 'no-store', // Ensure fresh data, especially for admin panel
    };
    const mergedOptions = { ...defaultOptions, ...options };

    let absoluteUrl = url;
    if (typeof window === 'undefined' && url.startsWith('/')) {
        // Server-side fetch, construct absolute URL
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
        absoluteUrl = `${baseUrl}${url}`;
    } else if (typeof window !== 'undefined' && url.startsWith('/')) {
        // Client-side fetch, relative URL is fine
    }

    try {
        const response = await fetch(absoluteUrl, mergedOptions);
        if (!response.ok) {
            const errorBody = await response.text();
            let errorData;
            try {
                errorData = JSON.parse(errorBody);
            } catch (e) {
                errorData = { message: errorBody || response.statusText };
            }
            const errorMessage = errorData.message || `API request failed with status ${response.status}`;
            // Use custom logger instead of console.error
            logger.error(`API Error (${response.status}) for ${absoluteUrl}: ${errorMessage}`);
            // Throw a custom error with the status code
            throw new ApiError(errorMessage, response.status);
        }
        if (response.status === 204) { // No Content
             return undefined as T;
        }
        return response.json() as Promise<T>;
    } catch (error: any) {
        // If it's not an ApiError we already threw, log it as a network/parsing error
        if (!(error instanceof ApiError)) {
            // Use custom logger instead of console.error
            logger.error(`Network or parsing error for ${absoluteUrl}: ${error.message}`);
        }
        // Re-throw the error (either the original ApiError or the new one)
        throw error;
    }
}

// --- Site Settings ---
const defaultSiteSettings: SiteSettings = {
    id: 'ss_main_default_placeholder',
    hospitalName: 'Grace Hospital',
    logoUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    telegramUrl: '',
    created_at: new Date().toISOString(),
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        const settings = await apiFetch<SiteSettings>(`/api/site-settings?t=${timestamp}`);
        return settings;
    } catch (error: any) {
        // Handle 404 specifically for site settings if needed, or just return default
        if (error instanceof ApiError && error.status === 404) {
             logger.warn("Site settings not found in DB (404), returning client-side default.");
        } else {
            logger.error("Failed to fetch site settings, returning client-side default:", error.message);
        }
        return defaultSiteSettings;
    }
};

export const updateSiteSettings = async (data: Partial<Omit<SiteSettings, 'id' | 'created_at'>> & { id?: string }): Promise<SiteSettings> => {
    const settingsId = data.id || 'ss_main'; // Use a predictable ID like 'ss_main'
    const { id, ...payload } = data;

    // Use POST which should handle upsert logic in the API route
    return apiFetch<SiteSettings>('/api/site-settings', {
        method: 'POST',
        body: JSON.stringify(payload),
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
};


// --- Hero Slides ---
export const getHeroSlides = async (): Promise<HeroSlide[]> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        return await apiFetch<HeroSlide[]>(`/api/hero-slides?t=${timestamp}`);
    } catch (error) {
        logger.error("Failed to fetch hero slides:", error);
        return []; // Return empty array on error
    }
};
export const createHeroSlide = async (data: Omit<HeroSlide, 'id' | 'created_at'>): Promise<HeroSlide> => {
    return apiFetch<HeroSlide>('/api/hero-slides', { 
        method: 'POST', 
        body: JSON.stringify(data),
        cache: 'no-store'
    });
};
export const updateHeroSlide = async (id: number, data: Partial<Omit<HeroSlide, 'id' | 'created_at'>>): Promise<HeroSlide | null> => {
    try {
        return await apiFetch<HeroSlide>(`/api/hero-slides/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(data),
            cache: 'no-store'
        });
    } catch (error) {
        logger.error(`Failed to update hero slide ${id}:`, error);
        return null;
    }
};
export const deleteHeroSlide = async (id: number): Promise<boolean> => {
    try {
        await apiFetch<void>(`/api/hero-slides/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        logger.error(`Failed to delete hero slide ${id}:`, error);
        return false;
    }
};

// --- About Content ---
const defaultAboutContent: AboutContent = {
    id: 'ac_main_default_placeholder', // Use a placeholder ID
    title: 'About Us',
    description: 'Default description about the hospital.',
    mission: 'Default mission statement.',
    vision: 'Default vision statement.',
    imageUrl: '',
    imageHint: '',
    created_at: new Date().toISOString(),
};

export const getAboutContent = async (): Promise<AboutContent> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        // API route GET returns a single object or 404
        const content = await apiFetch<AboutContent>(`/api/about-content?t=${timestamp}`);
        return content;
    } catch (error: any) {
        // *** FIX: Handle 404 specifically by returning default content ***
        if (error instanceof ApiError && error.status === 404) {
            logger.warn("About content not found in DB (404), returning client-side default.");
            // Return a copy of the default content to avoid potential mutations
            return { ...defaultAboutContent }; 
        } else {
            // For other errors, log and return default
            logger.error("Failed to fetch about content, returning client-side default:", error.message);
            return { ...defaultAboutContent };
        }
    }
};

export const updateAboutContent = async (data: Partial<Omit<AboutContent, 'id' | 'created_at'>> & { id?: string }): Promise<AboutContent> => {
    // The API route POST handles both create (if ID=1 doesn't exist) and update (if ID=1 exists)
    // We don't need to pass the ID in the payload if the API knows to use the fixed ID=1
    const { id, ...payload } = data;

    // *** FIX: Ensure imageUrl is not a data URI before sending ***
    // This check should ideally be in the component submitting the data,
    // but adding a safeguard here.
    if (typeof payload.imageUrl === 'string' && payload.imageUrl.startsWith('data:image')) {
        logger.warn('Attempting to save a data URI as imageUrl. This is likely too long for the database. Clearing imageUrl.');
        // Option 1: Clear it (safest if no upload mechanism exists)
        payload.imageUrl = ''; 
        // Option 2: Throw an error to be caught by the calling component
        // throw new Error('Cannot save image data directly. Please upload the image first and save the URL.');
    }

    // Always use POST to the base route, letting the backend handle insert/update for the fixed ID
    return apiFetch<AboutContent>('/api/about-content', {
        method: 'POST',
        body: JSON.stringify(payload),
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
};

// --- Services ---
export const getServices = async (): Promise<Service[]> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        return await apiFetch<Service[]>(`/api/services?t=${timestamp}`);
    } catch (error) {
        logger.error("Failed to fetch services:", error);
        return [];
    }
};
export const createService = async (data: Omit<Service, 'id' | 'created_at'>): Promise<Service> => {
    return apiFetch<Service>('/api/services', { 
        method: 'POST', 
        body: JSON.stringify(data),
        cache: 'no-store'
    });
};
export const updateService = async (id: string, data: Partial<Omit<Service, 'id' | 'created_at'>>): Promise<Service | null> => {
    try {
        return await apiFetch<Service>(`/api/services/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(data),
            cache: 'no-store'
        });
    } catch (error) {
        logger.error(`Failed to update service ${id}:`, error);
        return null;
    }
};
export const deleteService = async (id: string): Promise<boolean> => {
    try {
        await apiFetch<void>(`/api/services/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        logger.error(`Failed to delete service ${id}:`, error);
        return false;
    }
};

// --- Facilities ---
export const getFacilities = async (): Promise<Facility[]> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        return await apiFetch<Facility[]>(`/api/facilities?t=${timestamp}`);
    } catch (error) {
        logger.error("Failed to fetch facilities:", error);
        return [];
    }
};
export const createFacility = async (data: Omit<Facility, 'id' | 'created_at'>): Promise<Facility> => {
    return apiFetch<Facility>('/api/facilities', { 
        method: 'POST', 
        body: JSON.stringify(data),
        cache: 'no-store'
    });
};
export const updateFacility = async (id: string, data: Partial<Omit<Facility, 'id' | 'created_at'>>): Promise<Facility | null> => {
    try {
        return await apiFetch<Facility>(`/api/facilities/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(data),
            cache: 'no-store'
        });
    } catch (error) {
        logger.error(`Failed to update facility ${id}:`, error);
        return null;
    }
};
export const deleteFacility = async (id: string): Promise<boolean> => {
    try {
        await apiFetch<void>(`/api/facilities/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        logger.error(`Failed to delete facility ${id}:`, error);
        return false;
    }
};

// --- Departments ---
export const getDepartments = async (): Promise<Department[]> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        return await apiFetch<Department[]>(`/api/departments?t=${timestamp}`);
    } catch (error) {
        logger.error("Failed to fetch departments:", error);
        return [];
    }
};
export const createDepartment = async (data: Omit<Department, 'id' | 'created_at'>): Promise<Department> => {
    return apiFetch<Department>('/api/departments', { 
        method: 'POST', 
        body: JSON.stringify(data),
        cache: 'no-store'
    });
};
export const updateDepartment = async (id: string, data: Partial<Omit<Department, 'id' | 'created_at'>>): Promise<Department | null> => {
    try {
        return await apiFetch<Department>(`/api/departments/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(data),
            cache: 'no-store'
        });
    } catch (error) {
        logger.error(`Failed to update department ${id}:`, error);
        return null;
    }
};
export const deleteDepartment = async (id: string): Promise<boolean> => {
    try {
        await apiFetch<void>(`/api/departments/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        logger.error(`Failed to delete department ${id}:`, error);
        return false;
    }
};

// --- Gallery Items ---
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        return await apiFetch<GalleryItem[]>(`/api/gallery-items?t=${timestamp}`);
    } catch (error) {
        logger.error("Failed to fetch gallery items:", error);
        return [];
    }
};
export const createGalleryItem = async (data: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> => {
    return apiFetch<GalleryItem>('/api/gallery-items', { 
        method: 'POST', 
        body: JSON.stringify(data),
        cache: 'no-store'
    });
};
export const updateGalleryItem = async (id: string, data: Partial<Omit<GalleryItem, 'id' | 'created_at'>>): Promise<GalleryItem | null> => {
    try {
        return await apiFetch<GalleryItem>(`/api/gallery-items/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(data),
            cache: 'no-store'
        });
    } catch (error) {
        logger.error(`Failed to update gallery item ${id}:`, error);
        return null;
    }
};
export const deleteGalleryItem = async (id: string): Promise<boolean> => {
    try {
        await apiFetch<void>(`/api/gallery-items/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        logger.error(`Failed to delete gallery item ${id}:`, error);
        return false;
    }
};

// --- News Events ---
export const getNewsEvents = async (): Promise<NewsEvent[]> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        const items = await apiFetch<NewsEvent[]>(`/api/news-events?t=${timestamp}`);
        return items.map(item => ({
            ...item,
            date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
        }));
    } catch (error) {
        logger.error("Failed to fetch news events:", error);
        return [];
    }
};

export const getNewsEventById = async (idOrLink: string): Promise<NewsEvent | undefined> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        const item = await apiFetch<NewsEvent>(`/api/news-events/${encodeURIComponent(idOrLink)}?t=${timestamp}`);
        if (item) {
            return {
                ...item,
                date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
            };
        }
        return undefined;
    } catch (error: any) {
        if (error instanceof ApiError && error.status === 404) {
            return undefined;
        }
        logger.error(`Failed to fetch news event by id/link ${idOrLink}:`, error);
        throw error; // Re-throw other errors
    }
};
export const createNewsEvent = async (data: Omit<NewsEvent, 'id' | 'created_at'>): Promise<NewsEvent> => {
    const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date).split('T')[0],
    };
    return apiFetch<NewsEvent>('/api/news-events', { 
        method: 'POST', 
        body: JSON.stringify(payload),
        cache: 'no-store'
    });
};
export const updateNewsEvent = async (id: string, data: Partial<Omit<NewsEvent, 'id' | 'created_at'>>): Promise<NewsEvent | null> => {
    const payload = { ...data };
    if (payload.date) {
        payload.date = payload.date instanceof Date ? payload.date.toISOString().split('T')[0] : String(payload.date).split('T')[0];
    }
    try {
        return await apiFetch<NewsEvent>(`/api/news-events/${id}`, { 
            method: 'PUT', 
            body: JSON.stringify(payload),
            cache: 'no-store'
        });
    } catch (error) {
        logger.error(`Failed to update news event ${id}:`, error);
        return null;
    }
};
export const deleteNewsEvent = async (id: string): Promise<boolean> => {
    try {
        await apiFetch<void>(`/api/news-events/${id}`, { method: 'DELETE' });
        return true;
    } catch (error) {
        logger.error(`Failed to delete news event ${id}:`, error);
        return false;
    }
};

// --- Contact Info ---
const defaultContactInfo: ContactInfo = {
    id: 'ci_main_default_placeholder',
    address: '123 Hospital Rd, HealthCity',
    phone: '555-1234',
    email: 'contact@hospital.example',
    mapPlaceholder: 'Map data will load here.',
    created_at: new Date().toISOString(),
};
export const getContactInfo = async (): Promise<ContactInfo> => {
    try {
        // Force cache busting by adding a timestamp to the URL
        const timestamp = new Date().getTime();
        // Assuming contact info API returns a single object
        const info = await apiFetch<ContactInfo>(`/api/contact-info?t=${timestamp}`);
        return info;
    } catch (error: any) {
        if (error instanceof ApiError && error.status === 404) {
            logger.warn("Contact info not found in DB (404), returning client-side default.");
        } else {
            logger.error("Failed to fetch contact info, returning client-side default:", error.message);
        }
        return { ...defaultContactInfo };
    }
};
export const updateContactInfo = async (data: Partial<Omit<ContactInfo, 'id' | 'created_at'>> & { id?: string }): Promise<ContactInfo> => {
    const { id, ...payload } = data;
    // Use POST to handle upsert in the API
    return apiFetch<ContactInfo>('/api/contact-info', {
        method: 'POST',
        body: JSON.stringify(payload),
        cache: 'no-store',
        headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
        }
    });
};

// --- Authentication ---
// Original simple authentication function
const MOCK_ADMIN_USERNAME = 'admin';
const MOCK_ADMIN_PASSWORD = 'password123';

export const verifyAdminCredentials = async (username?: string, password?: string): Promise<boolean> => {
    logger.warn("Using MOCK admin authentication. Replace with a secure solution for production.");
    return username === MOCK_ADMIN_USERNAME && password === MOCK_ADMIN_PASSWORD;
};



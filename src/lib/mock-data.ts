
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


// --- Helper for API calls ---
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
        // Ensure NEXT_PUBLIC_APP_URL is set in .env.local for production/staging
        // It should be the full URL of your deployed application (e.g., https://yourdomain.com)
        // For local development, it defaults to http://localhost:9002 (from package.json dev script)
        const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:9002';
        absoluteUrl = `${baseUrl}${url}`;
        // console.log(`[API Fetch Server] Fetching absolute URL: ${absoluteUrl}`);
    } else if (typeof window !== 'undefined' && url.startsWith('/')) {
        // Client-side fetch, relative URL is fine
        // console.log(`[API Fetch Client] Fetching relative URL: ${url}`);
    }


    try {
        const response = await fetch(absoluteUrl, mergedOptions);
        if (!response.ok) {
            const errorBody = await response.text(); // Read as text first
            let errorData;
            try {
                errorData = JSON.parse(errorBody);
            } catch (e) {
                errorData = { message: errorBody || response.statusText };
            }
            console.error(`API Error (${response.status}) for ${absoluteUrl}:`, errorData.message || errorData);
            throw new Error(errorData.message || `API request failed with status ${response.status}`);
        }
        if (response.status === 204) { // No Content
             return undefined as T;
        }
        return response.json() as Promise<T>;
    } catch (error: any) {
        console.error(`Network or parsing error for ${absoluteUrl}:`, error.message, error.stack);
        throw error;
    }
}

// --- Site Settings ---
const defaultSiteSettings: SiteSettings = {
    id: 'ss_main_default_placeholder', // Placeholder ID
    hospitalName: 'Grace Hospital',
    logoUrl: '',
    facebookUrl: '',
    tiktokUrl: '',
    telegramUrl: '',
    created_at: new Date().toISOString(),
};

export const getSiteSettings = async (): Promise<SiteSettings> => {
    try {
        const settingsArray = await apiFetch<SiteSettings[]>('/api/site-settings');
        if (settingsArray && settingsArray.length > 0) {
            return settingsArray[0];
        }
        // If no settings found in DB, the API should ideally handle creating a default one,
        // or we return a hardcoded default for the frontend to function.
        console.warn("No site settings found in DB, returning client-side default.");
        return defaultSiteSettings;
    } catch (error) {
        console.error("Failed to fetch site settings, returning client-side default:", error);
        return defaultSiteSettings;
    }
};

export const updateSiteSettings = async (data: Partial<Omit<SiteSettings, 'id' | 'created_at'>> & { id?: string }): Promise<SiteSettings> => {
    // Site settings usually have a fixed ID or are treated as a single record.
    // The API should handle upsert logic. We expect 'id' to be known if updating.
    // If creating for the first time, API handles ID generation based on schema.
    const settingsId = data.id || 'ss_main'; // Assuming 'ss_main' as a convention for the single settings doc
    
    // Remove id from data if it was temporarily added for the call
    const { id, ...payload } = data;

    if (data.id && data.id !== defaultSiteSettings.id) { // If a real ID exists (not the placeholder)
         return apiFetch<SiteSettings>(`/api/site-settings/${settingsId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }
    // Attempt to POST, API should handle if it needs to create or update the single settings row.
    return apiFetch<SiteSettings>('/api/site-settings', {
        method: 'POST', // POST can also mean "create or update single resource"
        body: JSON.stringify(payload),
    });
};


// --- Hero Slides ---
export const getHeroSlides = async (): Promise<HeroSlide[]> => {
    return apiFetch<HeroSlide[]>('/api/hero-slides');
};
export const createHeroSlide = async (data: Omit<HeroSlide, 'id' | 'created_at'>): Promise<HeroSlide> => {
    return apiFetch<HeroSlide>('/api/hero-slides', { method: 'POST', body: JSON.stringify(data) });
};
export const updateHeroSlide = async (id: string, data: Partial<Omit<HeroSlide, 'id' | 'created_at'>>): Promise<HeroSlide | null> => {
    return apiFetch<HeroSlide>(`/api/hero-slides/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteHeroSlide = async (id: string): Promise<boolean> => {
    await apiFetch<void>(`/api/hero-slides/${id}`, { method: 'DELETE' });
    return true;
};

// --- About Content ---
const defaultAboutContent: AboutContent = {
    id: 'ac_main_default_placeholder',
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
        const contentArray = await apiFetch<AboutContent[]>('/api/about-content');
         if (contentArray && contentArray.length > 0) {
            return contentArray[0];
        }
        console.warn("No about content found in DB, returning client-side default.");
        return defaultAboutContent;
    } catch (error) {
        console.error("Failed to fetch about content, returning client-side default:", error);
        return defaultAboutContent;
    }
};
export const updateAboutContent = async (data: Partial<Omit<AboutContent, 'id' | 'created_at'>> & { id?: string }): Promise<AboutContent> => {
    const aboutId = data.id || 'ac_main'; // Assuming 'ac_main' for the single about content
    const { id, ...payload } = data;

    if (data.id && data.id !== defaultAboutContent.id) {
        return apiFetch<AboutContent>(`/api/about-content/${aboutId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }
     return apiFetch<AboutContent>('/api/about-content', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

// --- Services ---
export const getServices = async (): Promise<Service[]> => {
    return apiFetch<Service[]>('/api/services');
};
export const createService = async (data: Omit<Service, 'id' | 'created_at'>): Promise<Service> => {
    return apiFetch<Service>('/api/services', { method: 'POST', body: JSON.stringify(data) });
};
export const updateService = async (id: string, data: Partial<Omit<Service, 'id' | 'created_at'>>): Promise<Service | null> => {
    return apiFetch<Service>(`/api/services/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteService = async (id: string): Promise<boolean> => {
    await apiFetch<void>(`/api/services/${id}`, { method: 'DELETE' });
    return true;
};

// --- Facilities ---
export const getFacilities = async (): Promise<Facility[]> => {
    return apiFetch<Facility[]>('/api/facilities');
};
export const createFacility = async (data: Omit<Facility, 'id' | 'created_at'>): Promise<Facility> => {
    return apiFetch<Facility>('/api/facilities', { method: 'POST', body: JSON.stringify(data) });
};
export const updateFacility = async (id: string, data: Partial<Omit<Facility, 'id' | 'created_at'>>): Promise<Facility | null> => {
    return apiFetch<Facility>(`/api/facilities/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteFacility = async (id: string): Promise<boolean> => {
    await apiFetch<void>(`/api/facilities/${id}`, { method: 'DELETE' });
    return true;
};

// --- Departments ---
export const getDepartments = async (): Promise<Department[]> => {
    return apiFetch<Department[]>('/api/departments');
};
export const createDepartment = async (data: Omit<Department, 'id' | 'created_at'>): Promise<Department> => {
    return apiFetch<Department>('/api/departments', { method: 'POST', body: JSON.stringify(data) });
};
export const updateDepartment = async (id: string, data: Partial<Omit<Department, 'id' | 'created_at'>>): Promise<Department | null> => {
    return apiFetch<Department>(`/api/departments/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteDepartment = async (id: string): Promise<boolean> => {
    await apiFetch<void>(`/api/departments/${id}`, { method: 'DELETE' });
    return true;
};

// --- Gallery Items ---
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
    return apiFetch<GalleryItem[]>('/api/gallery-items');
};
export const createGalleryItem = async (data: Omit<GalleryItem, 'id' | 'created_at'>): Promise<GalleryItem> => {
    return apiFetch<GalleryItem>('/api/gallery-items', { method: 'POST', body: JSON.stringify(data) });
};
export const updateGalleryItem = async (id: string, data: Partial<Omit<GalleryItem, 'id' | 'created_at'>>): Promise<GalleryItem | null> => {
    return apiFetch<GalleryItem>(`/api/gallery-items/${id}`, { method: 'PUT', body: JSON.stringify(data) });
};
export const deleteGalleryItem = async (id: string): Promise<boolean> => {
    await apiFetch<void>(`/api/gallery-items/${id}`, { method: 'DELETE' });
    return true;
};

// --- News Events ---
export const getNewsEvents = async (): Promise<NewsEvent[]> => {
    try {
        const items = await apiFetch<NewsEvent[]>('/api/news-events');
        return items.map(item => ({
            ...item,
            // Ensure date is consistently handled. API should return string, but defensive parsing.
            date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
        }));
    } catch (error) {
        console.error("Failed to fetch news events:", error);
        return [];
    }
};

export const getNewsEventById = async (idOrLink: string): Promise<NewsEvent | undefined> => {
    try {
        const item = await apiFetch<NewsEvent>(`/api/news-events/${encodeURIComponent(idOrLink)}`);
        if (item) {
            return {
                ...item,
                date: typeof item.date === 'string' ? item.date : new Date(item.date).toISOString().split('T')[0],
            };
        }
        return undefined;
    } catch (error: any) {
        if (error.message.includes('404') || error.message.toLowerCase().includes('not found')) {
            return undefined;
        }
        console.error(`Failed to fetch news event by id/link ${idOrLink}:`, error);
        throw error;
    }
};
export const createNewsEvent = async (data: Omit<NewsEvent, 'id' | 'created_at'>): Promise<NewsEvent> => {
    // Ensure date is formatted as YYYY-MM-DD string before sending
    const payload = {
        ...data,
        date: data.date instanceof Date ? data.date.toISOString().split('T')[0] : String(data.date).split('T')[0],
    };
    return apiFetch<NewsEvent>('/api/news-events', { method: 'POST', body: JSON.stringify(payload) });
};
export const updateNewsEvent = async (id: string, data: Partial<Omit<NewsEvent, 'id' | 'created_at'>>): Promise<NewsEvent | null> => {
    const payload = { ...data };
    if (payload.date) {
        payload.date = payload.date instanceof Date ? payload.date.toISOString().split('T')[0] : String(payload.date).split('T')[0];
    }
    return apiFetch<NewsEvent>(`/api/news-events/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
};
export const deleteNewsEvent = async (id: string): Promise<boolean> => {
    await apiFetch<void>(`/api/news-events/${id}`, { method: 'DELETE' });
    return true;
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
        const infoArray = await apiFetch<ContactInfo[]>('/api/contact-info');
        if (infoArray && infoArray.length > 0) {
            return infoArray[0];
        }
        console.warn("No contact info found in DB, returning client-side default.");
        return defaultContactInfo;
    } catch (error) {
        console.error("Failed to fetch contact info, returning client-side default:", error);
        return defaultContactInfo;
    }
};
export const updateContactInfo = async (data: Partial<Omit<ContactInfo, 'id' | 'created_at'>> & { id?: string }): Promise<ContactInfo> => {
    const contactId = data.id || 'ci_main'; // Assuming 'ci_main' for the single contact info
    const { id, ...payload } = data;
    
    if (data.id && data.id !== defaultContactInfo.id) {
        return apiFetch<ContactInfo>(`/api/contact-info/${contactId}`, {
            method: 'PUT',
            body: JSON.stringify(payload),
        });
    }
    return apiFetch<ContactInfo>('/api/contact-info', {
        method: 'POST',
        body: JSON.stringify(payload),
    });
};

// --- Authentication (Mock - To be replaced with a real auth system e.g. NextAuth.js or Firebase Auth) ---
const MOCK_ADMIN_USERNAME = 'admin';
const MOCK_ADMIN_PASSWORD = 'password123';

export const verifyAdminCredentials = async (username?: string, password?: string): Promise<boolean> => {
    // IMPORTANT: This is NOT secure and for demonstration purposes only.
    // In a real application, this should be handled by a proper authentication system.
    console.warn("Using MOCK admin authentication. Replace with a secure solution for production.");
    return username === MOCK_ADMIN_USERNAME && password === MOCK_ADMIN_PASSWORD;
};

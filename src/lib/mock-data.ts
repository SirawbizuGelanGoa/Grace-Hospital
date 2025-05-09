// Simulate a simple in-memory database
// In a real app, this would interact with an actual database.

export type SiteSettings = {
    hospitalName: string;
    logoUrl?: string;
};

export type Service = {
  id: string;
  name: string;
  description: string;
  iconName: string; // Store icon name (from lucide-react) instead of component
};

export type Facility = {
    id: string;
    name: string;
    description: string;
    iconName: string;
};

export type Department = {
    id: string;
    name: string;
    description: string;
    iconName: string;
};

export type GalleryItem = {
    id: string;
    type: 'photo' | 'video';
    src: string;
    alt: string;
    hint?: string; // Optional AI hint
};

export type NewsEvent = {
    id: string;
    title: string;
    date: string; // ISO string date
    summary: string;
    image: string;
    link: string; // Usually a slug or separate page path
    hint?: string; // Optional AI hint
};

export type AboutContent = {
    title: string;
    description: string;
    mission: string;
    vision: string;
    imageUrl?: string; // Optional image URL
    imageHint?: string; // Optional hint for image AI
};

export type ContactInfo = {
    address: string;
    phone: string;
    email: string;
    mapPlaceholder?: string; // Or store actual map coordinates/embed URL
};

export type HeroSlide = {
    id: string;
    src: string;
    alt: string;
    hint?: string; // Optional AI hint for image search
    title?: string; // Optional title overlay
    subtitle?: string; // Optional subtitle overlay
    ctaLink?: string; // Optional call to action link
    ctaText?: string; // Optional call to action button text
};


let mockDb = {
    siteSettings: {
        hospitalName: 'Grace Hospital',
        logoUrl: '', // Example: 'https://example.com/logo.png' - Admin can set this
    } as SiteSettings,
    heroSlides: [
        {
            id: 'hs1',
            src: 'https://picsum.photos/1200/800?random=hero1',
            alt: 'State-of-the-art medical facility',
            hint: 'modern hospital',
            title: 'Welcome to Grace Hospital', // Updated Name
            subtitle: 'Your Health, Our Priority. Providing compassionate care.',
            ctaLink: '#contact',
            ctaText: 'Book Appointment',
        },
        {
            id: 'hs2',
            src: 'https://picsum.photos/1200/800?random=hero2',
            alt: 'Dedicated medical team',
            hint: 'doctors team',
            title: 'Expert Care, Always',
            subtitle: 'Meet our world-class specialists.',
            ctaLink: '#departments',
            ctaText: 'Our Departments',
        },
        {
            id: 'hs3',
            src: 'https://picsum.photos/1200/800?random=hero3',
            alt: 'Advanced technology in healthcare',
            hint: 'medical technology',
            title: 'Advanced Medical Technology',
            subtitle: 'Utilizing the latest innovations for better outcomes.',
            ctaLink: '#facilities',
            ctaText: 'Explore Facilities',
        },
    ] as HeroSlide[],
    about: {
        title: 'About Grace Hospital', // Updated Name
        description: 'Grace Hospital is committed to providing exceptional healthcare services with compassion and expertise. Our state-of-the-art facility is equipped with the latest technology, and our dedicated team of medical professionals works tirelessly to ensure the well-being of our patients. We believe in a patient-centric approach, offering personalized care tailored to individual needs.',
        mission: 'Our mission is to improve the health of our community by delivering high-quality, accessible, and comprehensive healthcare services.',
        vision: 'Our vision is to be the leading healthcare provider in the region, recognized for clinical excellence, patient satisfaction, and innovation.',
        imageUrl: 'https://picsum.photos/600/400?random=0',
        imageHint: 'doctors team',
    } as AboutContent,
    services: [
        { id: '1', name: 'General Medicine', description: 'Comprehensive care for adults and children.', iconName: 'Stethoscope' },
        { id: '2', name: 'Cardiology', description: 'Expert heart care and diagnostics.', iconName: 'HeartPulse' },
        { id: '3', name: 'Neurology', description: 'Specialized treatment for brain and nerve disorders.', iconName: 'Brain' },
        { id: '4', name: 'Orthopedics', description: 'Advanced care for bones and joints.', iconName: 'Bone' },
        { id: '5', name: 'Pediatrics', description: 'Dedicated healthcare for infants and children.', iconName: 'Baby' },
        { id: '6', name: 'Laboratory Services', description: 'Accurate diagnostic testing.', iconName: 'Microscope' },
    ] as Service[],
    facilities: [
        { id: '1', name: 'Modern Patient Rooms', description: 'Comfortable and well-equipped private and semi-private rooms.', iconName: 'BedDouble' },
        { id: '2', name: 'Advanced Laboratory', description: 'State-of-the-art diagnostic testing facilities.', iconName: 'FlaskConical' },
        { id: '3', name: 'Intensive Care Unit (ICU)', description: 'Specialized care for critically ill patients with continuous monitoring.', iconName: 'Monitor' },
        { id: '4', name: 'Outpatient Clinics', description: 'Convenient access to specialist consultations and follow-ups.', iconName: 'Stethoscope' },
        { id: '5', name: 'Emergency Department', description: '24/7 emergency care services with experienced staff.', iconName: 'Syringe' },
    ] as Facility[],
    departments: [
        { id: '1', name: 'Cardiology', description: 'Specializing in heart and vascular system disorders. We offer advanced diagnostics, treatments, and preventive care.', iconName: 'HeartPulse' },
        { id: '2', name: 'Neurology', description: 'Focused on the diagnosis and treatment of nervous system disorders, including the brain, spinal cord, and nerves.', iconName: 'Brain' },
        { id: '3', name: 'Orthopedics', description: 'Providing comprehensive care for musculoskeletal conditions, including bones, joints, ligaments, tendons, and muscles.', iconName: 'Bone' },
        { id: '4', name: 'Pediatrics', description: 'Dedicated to the medical care of infants, children, and adolescents.', iconName: 'Baby' },
        { id: '5', name: 'General Surgery', description: 'Offering a wide range of surgical procedures performed by experienced surgeons using modern techniques.', iconName: 'Stethoscope' },
        { id: '6', name: 'Oncology', description: 'Comprehensive cancer care including diagnosis, treatment, and support services.', iconName: 'ShieldCheck' },
    ] as Department[],
    gallery: [
        { id: 'p1', type: 'photo', src: 'https://picsum.photos/400/300?random=1', alt: 'Hospital lobby', hint: 'hospital lobby' },
        { id: 'p2', type: 'photo', src: 'https://picsum.photos/400/300?random=2', alt: 'Modern operating room', hint: 'operating room' },
        { id: 'p3', type: 'photo', src: 'https://picsum.photos/400/300?random=3', alt: 'Patient room interior', hint: 'patient room' },
        { id: 'p4', type: 'photo', src: 'https://picsum.photos/400/300?random=4', alt: 'Hospital garden area', hint: 'hospital garden' },
        { id: 'p5', type: 'photo', src: 'https://picsum.photos/400/300?random=5', alt: 'Doctors consulting', hint: 'doctors consulting' },
        { id: 'p6', type: 'photo', src: 'https://picsum.photos/400/300?random=6', alt: 'Advanced medical equipment', hint: 'medical equipment' },
        { id: 'v1', type: 'video', src: 'https://picsum.photos/400/300?random=7', alt: 'Hospital Tour Video Placeholder', hint: 'hospital video' },
        { id: 'v2', type: 'video', src: 'https://picsum.photos/400/300?random=8', alt: 'Patient Testimonial Video Placeholder', hint: 'patient testimonial' },
    ] as GalleryItem[],
    newsEvents: [
         { id: 'n1', title: 'Grace Hospital Opens New Cardiology Wing', date: '2024-07-15T00:00:00.000Z', summary: 'Our expanded cardiology department offers cutting-edge treatments and diagnostics.', image: 'https://picsum.photos/400/250?random=9', link: '/news/new-cardiology-wing', hint: 'hospital wing' },
         { id: 'n2', title: 'Free Health Check-up Camp', date: '2024-07-20T00:00:00.000Z', summary: 'Join us for a free health screening event next Saturday. Limited slots available.', image: 'https://picsum.photos/400/250?random=10', link: '/news/health-checkup-camp', hint: 'health camp' },
         { id: 'n3', title: 'Dr. Emily Carter Joins Grace Hospital', date: '2024-07-10T00:00:00.000Z', summary: 'We are pleased to welcome renowned neurologist Dr. Carter to our expert team.', image: 'https://picsum.photos/400/250?random=11', link: '/news/dr-carter-joins', hint: 'doctor portrait' },
     ] as NewsEvent[],
    contact: {
        address: '123 Grace Hospital Way, Healthville, ST 54321', // Updated Name
        phone: '(123) 456-7890',
        email: 'info@gracehospital.example', // Updated email domain
        mapPlaceholder: 'Map Placeholder - Coordinates or Embed URL would go here',
    } as ContactInfo,
};

// --- API Simulation ---

// Helper for simulating delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
const SIMULATED_DELAY = 50; // ms

// Function to generate unique IDs (very basic)
const generateId = () => Date.now().toString() + Math.random().toString(36).substring(2, 9);

// --- Site Settings ---
export const getSiteSettings = async (): Promise<SiteSettings> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.siteSettings));
};

export const updateSiteSettings = async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    await delay(SIMULATED_DELAY);
    mockDb.siteSettings = { ...mockDb.siteSettings, ...data };
    return JSON.parse(JSON.stringify(mockDb.siteSettings));
};


// --- Hero Slides ---
export const getHeroSlides = async (): Promise<HeroSlide[]> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.heroSlides));
};

export const createHeroSlide = async (data: Omit<HeroSlide, 'id'>): Promise<HeroSlide> => {
    await delay(SIMULATED_DELAY);
    const newSlide = { ...data, id: generateId() };
    mockDb.heroSlides.push(newSlide);
    return JSON.parse(JSON.stringify(newSlide));
};

export const updateHeroSlide = async (id: string, data: Partial<Omit<HeroSlide, 'id'>>): Promise<HeroSlide | null> => {
    await delay(SIMULATED_DELAY);
    const index = mockDb.heroSlides.findIndex(s => s.id === id);
    if (index === -1) return null;
    mockDb.heroSlides[index] = { ...mockDb.heroSlides[index], ...data };
    return JSON.parse(JSON.stringify(mockDb.heroSlides[index]));
};

export const deleteHeroSlide = async (id: string): Promise<boolean> => {
    await delay(SIMULATED_DELAY);
    const initialLength = mockDb.heroSlides.length;
    mockDb.heroSlides = mockDb.heroSlides.filter(s => s.id !== id);
    return mockDb.heroSlides.length < initialLength;
};


// --- About ---
export const getAboutContent = async (): Promise<AboutContent> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.about)); 
};

export const updateAboutContent = async (data: AboutContent): Promise<AboutContent> => {
    await delay(SIMULATED_DELAY);
    mockDb.about = { ...mockDb.about, ...data };
    return JSON.parse(JSON.stringify(mockDb.about));
};

// --- Services ---
export const getServices = async (): Promise<Service[]> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.services)); 
};

export const getServiceById = async (id: string): Promise<Service | undefined> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.services.find(s => s.id === id)));
};

export const createService = async (data: Omit<Service, 'id'>): Promise<Service> => {
    await delay(SIMULATED_DELAY);
    const newService = { ...data, id: generateId() };
    mockDb.services.push(newService);
    return JSON.parse(JSON.stringify(newService));
};

export const updateService = async (id: string, data: Partial<Omit<Service, 'id'>>): Promise<Service | null> => {
    await delay(SIMULATED_DELAY);
    const index = mockDb.services.findIndex(s => s.id === id);
    if (index === -1) return null;
    mockDb.services[index] = { ...mockDb.services[index], ...data };
    return JSON.parse(JSON.stringify(mockDb.services[index]));
};

export const deleteService = async (id: string): Promise<boolean> => {
    await delay(SIMULATED_DELAY);
    const initialLength = mockDb.services.length;
    mockDb.services = mockDb.services.filter(s => s.id !== id);
    return mockDb.services.length < initialLength;
};

// --- Facilities ---
export const getFacilities = async (): Promise<Facility[]> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.facilities));
};

export const getFacilityById = async (id: string): Promise<Facility | undefined> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.facilities.find(f => f.id === id)));
};

export const createFacility = async (data: Omit<Facility, 'id'>): Promise<Facility> => {
    await delay(SIMULATED_DELAY);
    const newFacility = { ...data, id: generateId() };
    mockDb.facilities.push(newFacility);
    return JSON.parse(JSON.stringify(newFacility));
};

export const updateFacility = async (id: string, data: Partial<Omit<Facility, 'id'>>): Promise<Facility | null> => {
    await delay(SIMULATED_DELAY);
    const index = mockDb.facilities.findIndex(f => f.id === id);
    if (index === -1) return null;
    mockDb.facilities[index] = { ...mockDb.facilities[index], ...data };
    return JSON.parse(JSON.stringify(mockDb.facilities[index]));
};

export const deleteFacility = async (id: string): Promise<boolean> => {
    await delay(SIMULATED_DELAY);
    const initialLength = mockDb.facilities.length;
    mockDb.facilities = mockDb.facilities.filter(f => f.id !== id);
    return mockDb.facilities.length < initialLength;
};

// --- Departments ---
export const getDepartments = async (): Promise<Department[]> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.departments));
};

export const getDepartmentById = async (id: string): Promise<Department | undefined> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.departments.find(d => d.id === id)));
};

export const createDepartment = async (data: Omit<Department, 'id'>): Promise<Department> => {
    await delay(SIMULATED_DELAY);
    const newDepartment = { ...data, id: generateId() };
    mockDb.departments.push(newDepartment);
    return JSON.parse(JSON.stringify(newDepartment));
};

export const updateDepartment = async (id: string, data: Partial<Omit<Department, 'id'>>): Promise<Department | null> => {
    await delay(SIMULATED_DELAY);
    const index = mockDb.departments.findIndex(d => d.id === id);
    if (index === -1) return null;
    mockDb.departments[index] = { ...mockDb.departments[index], ...data };
    return JSON.parse(JSON.stringify(mockDb.departments[index]));
};

export const deleteDepartment = async (id: string): Promise<boolean> => {
    await delay(SIMULATED_DELAY);
    const initialLength = mockDb.departments.length;
    mockDb.departments = mockDb.departments.filter(d => d.id !== id);
    return mockDb.departments.length < initialLength;
};

// --- Gallery ---
export const getGalleryItems = async (): Promise<GalleryItem[]> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.gallery));
};

export const getGalleryItemById = async (id: string): Promise<GalleryItem | undefined> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.gallery.find(g => g.id === id)));
};

export const createGalleryItem = async (data: Omit<GalleryItem, 'id'>): Promise<GalleryItem> => {
    await delay(SIMULATED_DELAY);
    const newItem = { ...data, id: generateId() };
    mockDb.gallery.push(newItem);
    return JSON.parse(JSON.stringify(newItem));
};

export const updateGalleryItem = async (id: string, data: Partial<Omit<GalleryItem, 'id'>>): Promise<GalleryItem | null> => {
    await delay(SIMULATED_DELAY);
    const index = mockDb.gallery.findIndex(g => g.id === id);
    if (index === -1) return null;
    mockDb.gallery[index] = { ...mockDb.gallery[index], ...data };
    return JSON.parse(JSON.stringify(mockDb.gallery[index]));
};

export const deleteGalleryItem = async (id: string): Promise<boolean> => {
    await delay(SIMULATED_DELAY);
    const initialLength = mockDb.gallery.length;
    mockDb.gallery = mockDb.gallery.filter(g => g.id !== id);
    return mockDb.gallery.length < initialLength;
};

// --- News & Events ---
export const getNewsEvents = async (): Promise<NewsEvent[]> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.newsEvents));
};

export const getNewsEventById = async (id: string): Promise<NewsEvent | undefined> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.newsEvents.find(n => n.id === id)));
};

export const createNewsEvent = async (data: Omit<NewsEvent, 'id'>): Promise<NewsEvent> => {
    await delay(SIMULATED_DELAY);
    const newEvent = { ...data, id: generateId() };
    mockDb.newsEvents.push(newEvent);
    mockDb.newsEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return JSON.parse(JSON.stringify(newEvent));
};

export const updateNewsEvent = async (id: string, data: Partial<Omit<NewsEvent, 'id'>>): Promise<NewsEvent | null> => {
    await delay(SIMULATED_DELAY);
    const index = mockDb.newsEvents.findIndex(n => n.id === id);
    if (index === -1) return null;
    mockDb.newsEvents[index] = { ...mockDb.newsEvents[index], ...data };
     mockDb.newsEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return JSON.parse(JSON.stringify(mockDb.newsEvents[index]));
};

export const deleteNewsEvent = async (id: string): Promise<boolean> => {
    await delay(SIMULATED_DELAY);
    const initialLength = mockDb.newsEvents.length;
    mockDb.newsEvents = mockDb.newsEvents.filter(n => n.id !== id);
    return mockDb.newsEvents.length < initialLength;
};


// --- Contact Info ---
export const getContactInfo = async (): Promise<ContactInfo> => {
    await delay(SIMULATED_DELAY);
    return JSON.parse(JSON.stringify(mockDb.contact));
};

export const updateContactInfo = async (data: ContactInfo): Promise<ContactInfo> => {
    await delay(SIMULATED_DELAY);
    mockDb.contact = { ...mockDb.contact, ...data };
    return JSON.parse(JSON.stringify(mockDb.contact));
};

// --- Authentication ---
const MOCK_ADMIN_USERNAME = 'admin';
const MOCK_ADMIN_PASSWORD = 'password123'; 

export const verifyAdminCredentials = async (username?: string, password?: string): Promise<boolean> => {
    await delay(SIMULATED_DELAY * 2); 
    return username === MOCK_ADMIN_USERNAME && password === MOCK_ADMIN_PASSWORD;
}

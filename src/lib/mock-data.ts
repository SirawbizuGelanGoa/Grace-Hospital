// Simulate a simple in-memory database
// In a real app, this would interact with an actual database.

export type SiteSettings = {
    hospitalName: string;
    logoUrl?: string;
};

export type Service = {
  id: string;
  name: string;
  description: string; // Short description for the front of the card
  detailedDescription: string; // Longer description for the back of the card
  iconName: string; // Store icon name (from lucide-react) instead of component
};

export type Facility = {
    id: string;
    name: string;
    description: string; // Short description for the card
    iconName: string;
    imageUrl?: string; // Image for the modal
    imageHint?: string; // Optional AI hint for the image
    detailedDescription: string; // Detailed description for the modal
};

export type Department = {
    id: string;
    name: string;
    description: string; // Short description for AccordionTrigger
    iconName: string;
    detailedDescription: string; // Detailed content for AccordionContent
    headOfDepartmentImage?: string; // Image of HOD for AccordionContent
    headOfDepartmentImageHint?: string; // AI hint for HOD image
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
    fullContent: string; // Detailed content for the news/event page
    image: string;
    link: string; // Usually a slug or separate page path, should be unique
    hint?: string; // Optional AI hint for the image
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
            title: 'Welcome to Grace Hospital', 
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
        title: 'About Grace Hospital', 
        description: 'Grace Hospital is committed to providing exceptional healthcare services with compassion and expertise. Our state-of-the-art facility is equipped with the latest technology, and our dedicated team of medical professionals works tirelessly to ensure the well-being of our patients. We believe in a patient-centric approach, offering personalized care tailored to individual needs.',
        mission: 'Our mission is to improve the health of our community by delivering high-quality, accessible, and comprehensive healthcare services.',
        vision: 'Our vision is to be the leading healthcare provider in the region, recognized for clinical excellence, patient satisfaction, and innovation.',
        imageUrl: 'https://picsum.photos/600/400?random=aboutGrace',
        imageHint: 'hospital staff',
    } as AboutContent,
    services: [
        { id: '1', name: 'General Medicine', description: 'Comprehensive care for adults and children.', detailedDescription: 'Our General Medicine department provides a wide range of services including routine check-ups, preventive care, management of chronic illnesses, and treatment for acute medical conditions. We focus on holistic patient health.', iconName: 'Stethoscope' },
        { id: '2', name: 'Cardiology', description: 'Expert heart care and diagnostics.', detailedDescription: 'The Cardiology department specializes in the diagnosis and treatment of heart diseases and cardiovascular conditions. We offer advanced diagnostic tools like ECG, echocardiography, and stress tests, along with personalized treatment plans.', iconName: 'HeartPulse' },
        { id: '3', name: 'Neurology', description: 'Specialized treatment for brain and nerve disorders.', detailedDescription: 'Our Neurology team is equipped to handle complex neurological disorders. Services include diagnosis and management of stroke, epilepsy, Parkinson\'s disease, multiple sclerosis, and other conditions affecting the brain, spinal cord, and nerves.', iconName: 'Brain' },
        { id: '4', name: 'Orthopedics', description: 'Advanced care for bones and joints.', detailedDescription: 'The Orthopedics department offers comprehensive care for bone, joint, ligament, tendon, and muscle injuries and conditions. We provide surgical and non-surgical treatments, including joint replacement and sports medicine.', iconName: 'Bone' },
        { id: '5', name: 'Pediatrics', description: 'Dedicated healthcare for infants and children.', detailedDescription: 'Our Pediatrics department provides compassionate and comprehensive care for children from infancy through adolescence. Services include well-child visits, immunizations, and treatment for common and complex childhood illnesses.', iconName: 'Baby' },
        { id: '6', name: 'Laboratory Services', description: 'Accurate diagnostic testing.', detailedDescription: 'Our state-of-the-art laboratory offers a full range of diagnostic tests, providing accurate and timely results to support patient care. We adhere to the highest standards of quality and precision.', iconName: 'Microscope' },
    ] as Service[],
    facilities: [
        { id: 'f1', name: 'Modern Patient Rooms', description: 'Comfortable and well-equipped for recovery.', iconName: 'BedDouble', imageUrl: 'https://picsum.photos/600/400?random=facility1', imageHint: 'patient room', detailedDescription: 'Our modern patient rooms are designed for comfort and recovery. Each room features an adjustable bed, private bathroom, television, and a call system for immediate assistance. We offer both private and semi-private options to suit patient needs and preferences, ensuring a restful environment for healing.' },
        { id: 'f2', name: 'Advanced Laboratory', description: 'State-of-the-art diagnostic testing.', iconName: 'FlaskConical', imageUrl: 'https://picsum.photos/600/400?random=facility2', imageHint: 'science lab', detailedDescription: 'Equipped with the latest technology, our advanced laboratory provides a comprehensive range of diagnostic tests. Our skilled technicians and pathologists work to deliver accurate and timely results, crucial for effective treatment planning and patient care.' },
        { id: 'f3', name: 'Intensive Care Unit (ICU)', description: 'Specialized critical care 24/7.', iconName: 'Activity', imageUrl: 'https://picsum.photos/600/400?random=facility3', imageHint: 'icu room', detailedDescription: 'The Intensive Care Unit (ICU) at Grace Hospital is a specialized facility dedicated to patients requiring constant monitoring and intensive medical care. Our ICU is staffed by critical care specialists and equipped with advanced life support systems to manage complex cases.' },
        { id: 'f4', name: 'Outpatient Clinics', description: 'Convenient specialist consultations.', iconName: 'Stethoscope', imageUrl: 'https://picsum.photos/600/400?random=facility4', imageHint: 'doctor office', detailedDescription: 'Our Outpatient Clinics offer easy access to a variety of medical specialists for consultations, follow-up appointments, and minor procedures. We aim to provide timely and efficient care in a comfortable setting, reducing the need for hospital admission when possible.' },
        { id: 'f5', name: 'Emergency Department', description: '24/7 immediate medical attention.', iconName: 'Hospital', imageUrl: 'https://picsum.photos/600/400?random=facility5', imageHint: 'emergency room', detailedDescription: 'Grace Hospital\'s Emergency Department operates around the clock, providing immediate medical attention for urgent and life-threatening conditions. Our experienced emergency physicians, nurses, and support staff are prepared to handle a wide range of medical emergencies with speed and expertise.' },
    ] as Facility[],
    departments: [
        { 
            id: 'd1', 
            name: 'Cardiology', 
            description: 'Specializing in heart and vascular system disorders.', 
            iconName: 'HeartPulse',
            detailedDescription: 'The Cardiology Department at Grace Hospital offers comprehensive care for a wide range of heart conditions. Our team of expert cardiologists utilizes cutting-edge diagnostic tools and treatment methods, including ECG, echocardiography, stress testing, and cardiac catheterization. We focus on preventive care, early detection, and personalized treatment plans for conditions such as coronary artery disease, heart failure, arrhythmias, and valvular heart disease. Our goal is to improve cardiovascular health and quality of life for our patients.',
            headOfDepartmentImage: 'https://picsum.photos/300/300?random=hod1',
            headOfDepartmentImageHint: 'cardiologist portrait'
        },
        { 
            id: 'd2', 
            name: 'Neurology', 
            description: 'Focused on the diagnosis and treatment of nervous system disorders.', 
            iconName: 'Brain',
            detailedDescription: 'Our Neurology Department provides specialized care for disorders affecting the brain, spinal cord, and nerves. We manage conditions such as stroke, epilepsy, Parkinson\'s disease, multiple sclerosis, migraines, and neuromuscular disorders. Our neurologists are equipped with advanced diagnostic capabilities, including EEG and MRI, to ensure accurate diagnoses and effective, individualized treatment strategies.',
            headOfDepartmentImage: 'https://picsum.photos/300/300?random=hod2',
            headOfDepartmentImageHint: 'neurologist portrait'
        },
        { 
            id: 'd3', 
            name: 'Orthopedics', 
            description: 'Providing comprehensive care for musculoskeletal conditions.', 
            iconName: 'Bone',
            detailedDescription: 'The Orthopedics Department at Grace Hospital is dedicated to treating injuries and diseases of the musculoskeletal system. This includes bones, joints, ligaments, tendons, muscles, and nerves. Our services range from non-surgical treatments and physical therapy to advanced surgical procedures like joint replacements, arthroscopy, and spinal surgery. We treat conditions such as fractures, arthritis, sports injuries, and back pain.',
            headOfDepartmentImage: 'https://picsum.photos/300/300?random=hod3',
            headOfDepartmentImageHint: 'orthopedic surgeon'
        },
        { 
            id: 'd4', 
            name: 'Pediatrics', 
            description: 'Dedicated to the medical care of infants, children, and adolescents.', 
            iconName: 'Baby',
            detailedDescription: 'Our Pediatrics Department offers compassionate and comprehensive healthcare for children from birth through adolescence. We provide well-child check-ups, immunizations, developmental screenings, and treatment for acute and chronic illnesses. Our pediatricians are committed to creating a child-friendly environment and partnering with families to ensure the healthy growth and development of their children.',
            headOfDepartmentImage: 'https://picsum.photos/300/300?random=hod4',
            headOfDepartmentImageHint: 'pediatrician friendly'
        },
        { 
            id: 'd5', 
            name: 'General Surgery', 
            description: 'Offering a wide range of surgical procedures.', 
            iconName: 'Scissors',
            detailedDescription: 'The General Surgery Department provides expert surgical care for a broad spectrum of conditions. Our skilled surgeons perform procedures related to the abdomen, digestive tract, endocrine system, breast, skin, and soft tissues. We utilize minimally invasive techniques whenever possible to promote faster recovery and reduce discomfort. Common procedures include appendectomies, hernia repairs, and gallbladder surgeries.',
            headOfDepartmentImage: 'https://picsum.photos/300/300?random=hod5',
            headOfDepartmentImageHint: 'surgeon confident'
        },
        { 
            id: 'd6', 
            name: 'Oncology', 
            description: 'Comprehensive cancer care and support services.', 
            iconName: 'ShieldCheck',
            detailedDescription: 'The Oncology Department at Grace Hospital is committed to providing comprehensive and compassionate cancer care. We offer a multidisciplinary approach involving medical oncologists, radiation oncologists, surgical oncologists, and support staff. Our services include advanced diagnostics, chemotherapy, immunotherapy, targeted therapy, radiation therapy, and access to clinical trials. We also provide vital support services such as nutritional counseling and psychosocial support for patients and their families.',
            headOfDepartmentImage: 'https://picsum.photos/300/300?random=hod6',
            headOfDepartmentImageHint: 'oncologist caring'
        },
    ] as Department[],
    gallery: [
        { id: 'p1', type: 'photo', src: 'https://picsum.photos/400/300?random=gallery1', alt: 'Hospital lobby', hint: 'hospital lobby' },
        { id: 'p2', type: 'photo', src: 'https://picsum.photos/400/300?random=gallery2', alt: 'Modern operating room', hint: 'operating room' },
        { id: 'p3', type: 'photo', src: 'https://picsum.photos/400/300?random=gallery3', alt: 'Patient room interior', hint: 'patient room' },
        { id: 'p4', type: 'photo', src: 'https://picsum.photos/400/300?random=gallery4', alt: 'Hospital garden area', hint: 'hospital garden' },
        { id: 'p5', type: 'photo', src: 'https://picsum.photos/400/300?random=gallery5', alt: 'Doctors consulting', hint: 'doctors consulting' },
        { id: 'p6', type: 'photo', src: 'https://picsum.photos/400/300?random=gallery6', alt: 'Advanced medical equipment', hint: 'medical equipment' },
        { id: 'v1', type: 'video', src: 'https://picsum.photos/400/300?random=video1', alt: 'Hospital Tour Video Placeholder', hint: 'hospital video' },
        { id: 'v2', type: 'video', src: 'https://picsum.photos/400/300?random=video2', alt: 'Patient Testimonial Video Placeholder', hint: 'patient testimonial' },
    ] as GalleryItem[],
    newsEvents: [
         { 
            id: 'n1', 
            title: 'Grace Hospital Opens New Cardiology Wing', 
            date: '2024-07-15T00:00:00.000Z', 
            summary: 'Our expanded cardiology department offers cutting-edge treatments and diagnostics.', 
            fullContent: 'Grace Hospital is thrilled to announce the grand opening of its new, state-of-the-art Cardiology Wing. This significant expansion enhances our ability to provide comprehensive cardiovascular care to the community.\n\nThe new wing features advanced diagnostic equipment, including the latest generation MRI and CT scanners specifically optimized for cardiac imaging, two new catheterization labs, and an expanded cardiac rehabilitation center. Patient rooms in the new wing are designed for comfort and equipped with advanced monitoring systems.\n\n"This investment underscores our commitment to heart health," said Dr. Alan Grant, Chief of Cardiology. "We can now offer more advanced procedures and accommodate a greater number of patients, reducing wait times and improving outcomes."\n\nThe expansion also includes dedicated spaces for research and physician training, positioning Grace Hospital at the forefront of cardiovascular innovation.',
            image: 'https://picsum.photos/400/250?random=news1', 
            link: '/news/new-cardiology-wing', 
            hint: 'hospital wing' 
        },
         { 
            id: 'n2', 
            title: 'Free Health Check-up Camp', 
            date: '2024-07-20T00:00:00.000Z', 
            summary: 'Join us for a free health screening event next Saturday. Limited slots available.', 
            fullContent: 'Grace Hospital is pleased to offer a Free Health Check-up Camp on Saturday, July 20th, from 9 AM to 3 PM. This community initiative aims to promote preventive healthcare and early detection of common health issues.\n\nServices offered will include:\n- Blood pressure monitoring\n- Blood sugar testing\n- Cholesterol screening\n- BMI assessment\n- Consultations with general physicians\n\n"We believe that access to basic health screenings is crucial for a healthy community," stated Ms. Jane Doe, Hospital Administrator. "This camp is part of our ongoing efforts to make healthcare more accessible."\n\nNo prior appointment is necessary, but services will be provided on a first-come, first-served basis. Please bring a valid ID. We encourage all community members to take advantage of this opportunity.',
            image: 'https://picsum.photos/400/250?random=news2', 
            link: '/news/health-checkup-camp', 
            hint: 'health camp' 
        },
         { 
            id: 'n3', 
            title: 'Dr. Emily Carter Joins Grace Hospital', 
            date: '2024-07-10T00:00:00.000Z', 
            summary: 'We are pleased to welcome renowned neurologist Dr. Carter to our expert team.', 
            fullContent: 'Grace Hospital proudly announces the addition of Dr. Emily Carter, a distinguished neurologist, to our medical staff. Dr. Carter brings over 15 years of experience in diagnosing and treating a wide range of neurological conditions, with a special interest in movement disorders and neurodegenerative diseases.\n\nDr. Carter completed her residency at Johns Hopkins Hospital and a fellowship in Movement Disorders at the Mayo Clinic. She is board-certified in Neurology and has published extensively in leading medical journals.\n\n"I am excited to join the exceptional team at Grace Hospital and contribute to its mission of providing outstanding patient care," Dr. Carter said. "I look forward to serving the community and advancing neurological care in the region."\n\nDr. Carter is now accepting new patients. To schedule an appointment, please call our Neurology Department.',
            image: 'https://picsum.photos/400/250?random=news3', 
            link: '/news/dr-carter-joins', 
            hint: 'doctor portrait' 
        },
     ] as NewsEvent[],
    contact: {
        address: '123 Grace Hospital Way, Healthville, ST 54321', 
        phone: '(123) 456-7890',
        email: 'info@gracehospital.example', 
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
    mockDb.heroSlides.unshift(newSlide); // Add to beginning
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
    mockDb.services.unshift(newService);
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
    mockDb.facilities.unshift(newFacility);
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
    mockDb.departments.unshift(newDepartment);
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
    mockDb.gallery.unshift(newItem);
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
    return JSON.parse(JSON.stringify(mockDb.newsEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())));
};

export const getNewsEventById = async (id: string): Promise<NewsEvent | undefined> => {
    await delay(SIMULATED_DELAY);
    // The link field is used as a unique slug, so we search by that.
    // If `id` is truly the unique identifier, then search by `n.id === id`.
    // For now, assuming `id` parameter corresponds to the `id` field.
    return JSON.parse(JSON.stringify(mockDb.newsEvents.find(n => n.id === id)));
};

export const createNewsEvent = async (data: Omit<NewsEvent, 'id'>): Promise<NewsEvent> => {
    await delay(SIMULATED_DELAY);
    // Ensure the link is unique if it's used as a slug for routing
    const existingLinks = mockDb.newsEvents.map(e => e.link);
    if (existingLinks.includes(data.link)) {
        // Basic way to make link unique, in real app, better slug generation is needed
        data.link = `${data.link}-${Date.now().toString().slice(-4)}`;
    }
    const newEvent = { ...data, id: generateId() };
    mockDb.newsEvents.push(newEvent);
    mockDb.newsEvents.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return JSON.parse(JSON.stringify(newEvent));
};

export const updateNewsEvent = async (id: string, data: Partial<Omit<NewsEvent, 'id'>>): Promise<NewsEvent | null> => {
    await delay(SIMULATED_DELAY);
    const index = mockDb.newsEvents.findIndex(n => n.id === id);
    if (index === -1) return null;
    
    // Ensure link uniqueness if it's being changed
    if (data.link && data.link !== mockDb.newsEvents[index].link) {
        const existingLinks = mockDb.newsEvents.filter(e => e.id !== id).map(e => e.link);
        if (existingLinks.includes(data.link)) {
             data.link = `${data.link}-${Date.now().toString().slice(-4)}`;
        }
    }

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

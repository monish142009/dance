/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Landmark, Phone, Mail, MapPin, Clock, ArrowRight, Award, 
  Sparkles, ShieldCheck, Compass, Calendar, Image as ImageIcon, 
  UserCheck, Heart, Instagram, Facebook, Youtube
} from 'lucide-react';

import Navbar from './components/Navbar';
import Biography from './components/Biography';
import GallerySection from './components/GallerySection';
import RegistrationForm from './components/RegistrationForm';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';

import { 
  DEFAULT_INSTRUCTOR_PROFILE, 
  DEFAULT_CLASSES, 
  DEFAULT_GALLERY,
  ALL_TEACHERS_PROFILES
} from './data/kuchipudiData';
import { ClassSchedule, GalleryItem, Registration, InstructorProfile } from './types';

import { db } from './firebase';
import { collection, onSnapshot, doc, setDoc } from 'firebase/firestore';

export default function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [preSelectedClassId, setPreSelectedClassId] = useState<string>('');

  // Core Persisted States
  const [schedules, setSchedules] = useState<ClassSchedule[]>(() => {
    try {
      const cached = localStorage.getItem('kuchipudi_schedules_v2');
      return cached ? JSON.parse(cached) : DEFAULT_CLASSES;
    } catch {
      return DEFAULT_CLASSES;
    }
  });

  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const cached = localStorage.getItem('kuchipudi_gallery_v2');
      return cached ? JSON.parse(cached) : DEFAULT_GALLERY;
    } catch {
      return DEFAULT_GALLERY;
    }
  });

  const [registrations, setRegistrations] = useState<Registration[]>(() => {
    try {
      const cached = localStorage.getItem('kuchipudi_registrations_v2');
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [teachers, setTeachers] = useState<InstructorProfile[]>(() => {
    try {
      const cached = localStorage.getItem('kuchipudi_teachers_v2');
      return cached ? JSON.parse(cached) : ALL_TEACHERS_PROFILES;
    } catch {
      return ALL_TEACHERS_PROFILES;
    }
  });

  // Persist state updates to local storage
  useEffect(() => {
    localStorage.setItem('kuchipudi_schedules_v2', JSON.stringify(schedules));
  }, [schedules]);

  useEffect(() => {
    localStorage.setItem('kuchipudi_gallery_v2', JSON.stringify(galleryItems));
  }, [galleryItems]);

  useEffect(() => {
    localStorage.setItem('kuchipudi_registrations_v2', JSON.stringify(registrations));
  }, [registrations]);

  useEffect(() => {
    localStorage.setItem('kuchipudi_teachers_v2', JSON.stringify(teachers));
  }, [teachers]);

  // Load session states and sync with Firebase Firestore in real-time
  useEffect(() => {
    const cachedAdmin = sessionStorage.getItem('kuchipudi_admin_session');
    if (cachedAdmin === 'active') {
      setIsAdmin(true);
    }

    // 1. Sync Gallery Items
    const unsubscribeGallery = onSnapshot(collection(db, "gallery"), (snapshot) => {
      if (snapshot.empty) {
        // Seeding initial default items if empty
        DEFAULT_GALLERY.forEach((item) => {
          setDoc(doc(db, "gallery", item.id), item).catch(err => console.error("Error seeding gallery:", err));
        });
        setGalleryItems(DEFAULT_GALLERY);
      } else {
        const items: GalleryItem[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as GalleryItem);
        });
        // Sort items so that the newest additions (or based on dynamic ID/timestamp) come first
        items.sort((a, b) => {
          const aTime = a.id.startsWith('media-custom-') ? parseInt(a.id.split('-')[2]) : 0;
          const bTime = b.id.startsWith('media-custom-') ? parseInt(b.id.split('-')[2]) : 0;
          if (aTime && bTime) {
            return bTime - aTime; // Newest first
          }
          if (aTime) return -1;
          if (bTime) return 1;
          return a.id.localeCompare(b.id);
        });
        setGalleryItems(items);
      }
    }, (error) => {
      console.error("Gallery snapshot error:", error);
    });

    // 2. Sync Instructors / Teachers
    const unsubscribeTeachers = onSnapshot(collection(db, "teachers"), (snapshot) => {
      if (snapshot.empty) {
        ALL_TEACHERS_PROFILES.forEach((profile) => {
          const docId = profile.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
          setDoc(doc(db, "teachers", docId), profile).catch(err => console.error("Error seeding teachers:", err));
        });
        setTeachers(ALL_TEACHERS_PROFILES);
      } else {
        const items: InstructorProfile[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as InstructorProfile);
        });
        setTeachers(items);
      }
    }, (error) => {
      console.error("Teachers snapshot error:", error);
    });

    // 3. Sync Course Schedules
    const unsubscribeSchedules = onSnapshot(collection(db, "schedules"), (snapshot) => {
      if (snapshot.empty) {
        DEFAULT_CLASSES.forEach((course) => {
          setDoc(doc(db, "schedules", course.id), course).catch(err => console.error("Error seeding schedules:", err));
        });
        setSchedules(DEFAULT_CLASSES);
      } else {
        const items: ClassSchedule[] = [];
        snapshot.forEach((doc) => {
          items.push(doc.data() as ClassSchedule);
        });
        items.sort((a, b) => a.id.localeCompare(b.id));
        setSchedules(items);
      }
    }, (error) => {
      console.error("Schedules snapshot error:", error);
    });

    // 4. Sync Registrations
    const unsubscribeRegistrations = onSnapshot(collection(db, "registrations"), (snapshot) => {
      const items: Registration[] = [];
      snapshot.forEach((doc) => {
        items.push(doc.data() as Registration);
      });
      items.sort((a, b) => {
        const aTime = a.id.startsWith('reg-') ? parseInt(a.id.split('-')[1]) : 0;
        const bTime = b.id.startsWith('reg-') ? parseInt(b.id.split('-')[1]) : 0;
        if (aTime && bTime) {
          return bTime - aTime;
        }
        return b.registrationDate.localeCompare(a.registrationDate);
      });
      setRegistrations(items);
    }, (error) => {
      console.error("Registrations snapshot error:", error);
    });

    return () => {
      unsubscribeGallery();
      unsubscribeTeachers();
      unsubscribeSchedules();
      unsubscribeRegistrations();
    };
  }, []);

  // Handle Login success
  const handleLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('kuchipudi_admin_session', 'active');
    setCurrentTab('admin');
  };

  // Handle Logout
  const handleLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('kuchipudi_admin_session');
    if (currentTab === 'admin') {
      setCurrentTab('home');
    }
  };

  // Action: direct selection of a course to sign up
  const handleSelectClassToEnroll = (classId: string) => {
    setPreSelectedClassId(classId);
    setCurrentTab('register');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Action: submit student registration
  const handleRegisterSubmit = (newReg: Omit<Registration, 'id' | 'registrationDate' | 'status'>) => {
    const freshRecord: Registration = {
      ...newReg,
      id: `reg-${Date.now()}`,
      registrationDate: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      }),
      status: 'Pending'
    };

    setRegistrations(prev => [freshRecord, ...prev]);

    // Save registration record to Firestore
    setDoc(doc(db, "registrations", freshRecord.id), freshRecord).catch(err => console.error("Error saving registration to Firestore:", err));

    // Automatically increment the registered count in schedules both locally and in Firestore
    setSchedules(prev => prev.map(course => {
      if (course.id === newReg.selectedClassId) {
        const updatedCourse = { ...course, registeredCount: Math.min(course.maxStudents, course.registeredCount + 1) };
        setDoc(doc(db, "schedules", course.id), updatedCourse).catch(err => console.error("Error updating course count in Firestore:", err));
        return updatedCourse;
      }
      return course;
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fdfcfb] kuchipudi-pattern font-sans antialiased text-stone-850">
      
      {/* Background Watermark */}
      <div className="kuchipudi-dancer-bg" />
      
      {/* Academy Navigation Header */}
      <Navbar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        isAdmin={isAdmin} 
        logout={handleLogout} 
      />

      {/* Main Content Area */}
      <main className="flex-grow">
        
        {/* 1. HOME VIEW */}
        {currentTab === 'home' && (
          <div className="space-y-16 sm:space-y-24">
            
            {/* Elegant Classical Hero Banner Section */}
            <section className="relative overflow-hidden bg-[#130d0a] text-stone-100 border-b border-[#291e18] py-20 sm:py-32 flex items-center">
              {/* Background aesthetic highlights */}
              <div className="absolute inset-0 z-0 opacity-40">
                <img 
                  src="https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&q=80&w=1600" 
                  alt="" 
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover filter brightness-[0.6] contrast-[1.1]"
                />
              </div>
              {/* Overlay shading */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#130d0a] via-[#130d0a]/90 to-transparent z-10"></div>
              
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Call to Action Left (7 Columns) */}
                <div className="lg:col-span-7 space-y-6 text-left">
                  <span className="text-[#c5a059] font-semibold text-xs sm:text-sm tracking-[0.25em] uppercase block">
                    ✦ Traditional Gurukul Parampara ✦
                  </span>
                  
                  <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight leading-tight text-white">
                    Natyakriya <br />
                    <span className="text-[#c5a059]">Kuchipudi</span> Academy
                  </h1>
                  
                  <p className="text-stone-300 text-base sm:text-lg font-light leading-relaxed max-w-xl">
                    Embark on a profound journey of classical Indian expressions, rigorous rhythm synchronization, and divine storytelling. Under the guidance of award-winning Guru Srimayi Devi.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button 
                      onClick={() => setCurrentTab('register')}
                      className="px-8 py-3.5 bg-[#c5a059] hover:bg-[#b08b49] text-white font-bold text-sm tracking-wider uppercase rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>Enroll Online</span>
                      <ArrowRight className="h-4 w-4" />
                    </button>
                    <button 
                      onClick={() => setCurrentTab('gallery')}
                      className="px-8 py-3.5 border-2 border-stone-700 hover:bg-white/5 text-stone-200 font-bold text-sm tracking-wider uppercase rounded-lg transition-all flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <span>View Media Library</span>
                    </button>
                  </div>
                </div>

                {/* Hero Visual Right (5 Columns) */}
                <div className="lg:col-span-5 hidden lg:block">
                  <div className="relative group">
                    {/* Exquisite golden dashed border frame */}
                    <div className="absolute -inset-4 rounded-2xl border border-dashed border-[#c5a059]/40 -z-10 group-hover:scale-105 transition-transform duration-500"></div>
                    
                    <div className="aspect-[3/4] bg-[#1c1411] border border-stone-850 p-3 rounded-2xl shadow-2xl">
                      <img 
                        src="https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&q=80&w=800" 
                        alt="Distinguished Kuchipudi Dancer" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* Core Values / Academy Pillars (Bento grid style) */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-stone-500 font-semibold text-sm tracking-widest uppercase block mb-2">
                  The Pillars of our School
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#9c7a46]">
                  Why Choose Natyakriya?
                </h2>
                <div className="h-[1px] w-16 bg-[#c5a059] mx-auto my-3" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* Pillar 1 */}
                <div className="bg-white border border-stone-200/80 p-8 rounded-2xl space-y-4 shadow-xs text-center md:text-left hover:shadow-md transition-shadow">
                  <div className="bg-[#c5a059]/10 p-3 rounded-full text-[#c5a059] w-12 h-12 flex items-center justify-center mx-auto md:mx-0">
                    <Award className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#9c7a46]">Traditional Lineage</h3>
                  <p className="text-stone-600 font-light text-sm leading-relaxed">
                    Direct heritage lineage traced back to legendary gurus. We preserve original temple standards, hand gestures, posture definitions, and spiritual discipline.
                  </p>
                </div>

                {/* Pillar 2 */}
                <div className="bg-white border border-stone-200/80 p-8 rounded-2xl space-y-4 shadow-xs text-center md:text-left hover:shadow-md transition-shadow">
                  <div className="bg-[#c5a059]/10 p-3 rounded-full text-[#c5a059] w-12 h-12 flex items-center justify-center mx-auto md:mx-0">
                    <Sparkles className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#9c7a46]">Stage Recital Focus</h3>
                  <p className="text-stone-600 font-light text-sm leading-relaxed">
                    Our students gain high exposure, regularly performing at regional dance dramas, prestigious classical festivals, and our grand annual Gurukul recitals.
                  </p>
                </div>

                {/* Pillar 3 */}
                <div className="bg-white border border-stone-200/80 p-8 rounded-2xl space-y-4 shadow-xs text-center md:text-left hover:shadow-md transition-shadow">
                  <div className="bg-[#c5a059]/10 p-3 rounded-full text-[#c5a059] w-12 h-12 flex items-center justify-center mx-auto md:mx-0">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-[#9c7a46]">Certified Graduation</h3>
                  <p className="text-stone-600 font-light text-sm leading-relaxed">
                    Structured syllabus levels including Prarambhik, Praveshika, Madhyama, and Kovida culminate in certified diplomas and complete solo performance readiness.
                  </p>
                </div>

              </div>
            </section>



            {/* Quick Guru Welcome Preview block */}
            <section className="bg-[#faf9f6] border-y border-stone-200/60 py-16">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Instructor Photo (4 Columns) */}
                <div className="lg:col-span-4 max-w-sm mx-auto">
                  <div className="border border-stone-200 p-3 bg-white rounded-2xl shadow-xs">
                    <div className="aspect-square rounded-xl overflow-hidden bg-stone-100">
                      <img 
                        src={DEFAULT_INSTRUCTOR_PROFILE.imageUrl} 
                        alt="Guru Srimayi Devi" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                </div>

                {/* Welcome Message (8 Columns) */}
                <div className="lg:col-span-8 space-y-6 text-center lg:text-left">
                  <span className="text-stone-500 text-xs font-mono font-bold tracking-widest uppercase block">
                    Message from the Artistic Director
                  </span>
                  
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-[#9c7a46]">
                    "Dance is a Divine Dialogue"
                  </h3>
                  
                  <p className="text-stone-600 font-light text-sm sm:text-base leading-relaxed italic">
                    "At Natyakriya Academy, we do not merely teach steps. We cultivate discipline, alignment, spiritual connection, and the emotional vocabulary required to speak through the eyes and hands. Whether you are a small child taking your very first steps in classical art, or an advanced dancer pursuing solo stage accomplishments, our Gurukul doors are open to guide you."
                  </p>
                  
                  <div className="pt-2 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
                    <button 
                      onClick={() => setCurrentTab('biography')}
                      className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-semibold uppercase tracking-wider rounded-lg transition-colors cursor-pointer shadow-xs"
                    >
                      Read Guru Biography & Lineage
                    </button>
                  </div>
                </div>

              </div>
            </section>

            {/* Highlighted Gallery Preview section */}
            <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-12 gap-y-4">
                <div>
                  <span className="text-stone-500 font-semibold text-xs sm:text-sm tracking-widest uppercase block mb-1">
                    Visual Portfolios
                  </span>
                  <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl font-bold text-[#9c7a46] tracking-tight">
                    Academy Captured Moments
                  </h2>
                </div>
                <button 
                  onClick={() => setCurrentTab('gallery')}
                  className="text-xs sm:text-sm text-[#9c7a46] font-bold uppercase tracking-wider hover:text-[#806130] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Explore Full Gallery</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>

              {/* Grid of first 3 images */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {galleryItems.slice(0, 3).map((item) => (
                  <div 
                    key={item.id}
                    onClick={() => setCurrentTab('gallery')}
                    className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="aspect-video sm:aspect-square relative overflow-hidden bg-stone-100">
                      <img 
                        src={item.url} 
                        alt="" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                        <span className="text-[#c5a059] text-xs font-bold uppercase font-mono tracking-wider">{item.category}</span>
                      </div>
                    </div>
                    <div className="p-4 border-t border-stone-100">
                      <h4 className="font-serif text-[#9c7a46] font-bold text-sm truncate">{item.title}</h4>
                      <p className="text-stone-500 font-light text-xs truncate mt-0.5">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Offline Center Location details */}
            <section className="bg-[#faf9f6] border-t border-stone-200/60 py-16 sm:py-20">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Contact and address details (6 columns) */}
                <div className="lg:col-span-6 space-y-6">
                  <span className="text-stone-500 font-bold text-xs font-mono tracking-widest uppercase block">
                    Admissions & Visit Information
                  </span>
                  <h2 className="font-serif text-3xl font-bold text-[#9c7a46]">
                    Our Main Gurukul Studio
                  </h2>
                  <p className="text-stone-600 font-light text-sm sm:text-base leading-relaxed">
                    Located in a peaceful, spacious sector, our academy features high-quality traditional wooden floors, state-of-the-art music systems, and an exquisite shrine for Lord Nataraja, offering a perfect environment for spiritual classical training.
                  </p>

                  <div className="space-y-4 text-xs sm:text-sm text-stone-600 pt-4">
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-5 w-5 text-[#c5a059] shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-stone-800">Physical Address</span>
                        <span className="font-light text-stone-500">Near Pragathi Nagar, Hyderabad, India</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Phone className="h-5 w-5 text-[#c5a059] shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-stone-800">Phone inquiries</span>
                        <span className="font-light text-stone-500">+91 95736 92538</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
                      <svg className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5 fill-current" viewBox="0 0 24 24">
                        <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.04 1.012 11.45 1.01c-5.44 0-9.866 4.372-9.87 9.802 0 1.96.512 3.878 1.483 5.581l-.97 3.538 3.654-.955zm11.722-6.52c-.312-.156-1.848-.91-2.127-1.01-.279-.1-.482-.15-.68.15-.199.3-.77.97-.943 1.17-.173.201-.347.227-.66.071-1.127-.565-1.907-1.002-2.664-2.299-.199-.34-.199-.589-.043-.745.14-.14.312-.363.468-.545.156-.182.208-.312.312-.52.104-.207.052-.389-.026-.545-.078-.156-.682-1.642-.934-2.25-.246-.593-.497-.513-.68-.522-.177-.008-.379-.01-.58-.01-.202 0-.53.076-.807.379-.278.303-1.062 1.037-1.062 2.529 0 1.492 1.085 2.932 1.236 3.134.152.202 2.137 3.262 5.176 4.57.722.311 1.285.498 1.724.638.725.23 1.385.197 1.905.12.58-.088 1.848-.756 2.11-1.45.263-.693.263-1.287.185-1.411-.078-.124-.279-.201-.59-.356z" />
                      </svg>
                      <div>
                        <span className="block font-bold text-emerald-700">WhatsApp Support (Instant chat)</span>
                        <a 
                          href="https://wa.me/919573692538?text=Hello%20Natyakriya%20Academy%2C%20I%20am%20interested%20in%20Kuchipudi%20classes." 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="font-semibold text-emerald-600 hover:text-emerald-700 hover:underline inline-flex items-center space-x-1 mt-0.5"
                        >
                          <span>+91 95736 92538</span>
                          <span className="text-xs font-normal text-stone-500 ml-1">(Click to open Chat)</span>
                        </a>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Mail className="h-5 w-5 text-[#c5a059] shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-stone-800">Admissions Email</span>
                        <span className="font-light text-stone-500">admissions@natyakriyaacademy.org</span>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3">
                      <Clock className="h-5 w-5 text-[#c5a059] shrink-0 mt-0.5" />
                      <div>
                        <span className="block font-bold text-stone-800">Studio working hours</span>
                        <span className="font-light text-stone-500">Tuesday - Friday: 04:00 PM - 08:30 PM <br />Saturday - Sunday: 08:30 AM - 01:00 PM (Monday Holiday)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Map illustrative placeholder card (6 columns) */}
                <div className="lg:col-span-6">
                  <div className="border border-stone-200 p-4 bg-white rounded-2xl h-full flex flex-col justify-between shadow-xs">
                    <div className="aspect-[16/10] bg-[#faf9f6] rounded-xl overflow-hidden relative shadow-inner border border-stone-200">
                      {/* Generative schematic map background layout */}
                      <div className="absolute inset-0 opacity-40">
                        <div className="absolute top-0 bottom-0 left-12 w-0.5 bg-stone-300" />
                        <div className="absolute top-0 bottom-0 left-28 w-0.5 bg-stone-300" />
                        <div className="absolute top-0 bottom-0 left-52 w-0.5 bg-stone-300" />
                        <div className="absolute left-0 right-0 top-12 h-0.5 bg-stone-300" />
                        <div className="absolute left-0 right-0 top-32 h-0.5 bg-stone-300" />
                        <div className="absolute left-0 right-0 top-48 h-0.5 bg-stone-300" />
                      </div>
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-4 text-center">
                        <div className="bg-[#c5a059] p-3 rounded-full text-white shadow-md animate-bounce">
                          <MapPin className="h-6 w-6" />
                        </div>
                        <h4 className="font-serif text-[#9c7a46] font-bold text-base mt-3">Natyakriya Academy</h4>
                        <p className="text-stone-600 font-light text-xs mt-1 max-w-xs">Near Pragathi Nagar, Hyderabad, India</p>
                      </div>
                    </div>

                    <div className="pt-4 text-center">
                      <span className="text-xs text-stone-500 italic">No appointment needed for weekend visit. Visitors are welcome to view rehearsal sessions.</span>
                    </div>
                  </div>
                </div>

              </div>
            </section>

          </div>
        )}

        {/* 2. BIOGRAPHY VIEW */}
        {currentTab === 'biography' && (
          <Biography 
            teachers={teachers}
            onRegisterClick={() => setCurrentTab('register')} 
          />
        )}

        {/* 5. GALLERY VIEW */}
        {currentTab === 'gallery' && (
          <GallerySection 
            galleryItems={galleryItems} 
          />
        )}

        {/* 6. STUDENT REGISTRATION VIEW */}
        {currentTab === 'register' && (
          <RegistrationForm 
            schedules={schedules} 
            preSelectedClassId={preSelectedClassId}
            onRegisterSubmit={handleRegisterSubmit}
          />
        )}

        {/* 7. PORTAL LOGINS VIEW */}
        {currentTab === 'login' && (
          <Login 
            onLoginSuccess={handleLoginSuccess} 
          />
        )}

        {/* 8. ADMIN CONTROL PANEL VIEW */}
        {currentTab === 'admin' && isAdmin && (
          <AdminPanel
            schedules={schedules}
            setSchedules={setSchedules}
            galleryItems={galleryItems}
            setGalleryItems={setGalleryItems}
            registrations={registrations}
            setRegistrations={setRegistrations}
            teachers={teachers}
            setTeachers={setTeachers}
          />
        )}

      </main>

      {/* Exquisite footer matching design language */}
      <footer className="bg-[#faf9f6] text-stone-600 border-t border-stone-200 py-12 sm:py-16 text-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Column 1: School Identity */}
          <div className="md:col-span-5 space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-white border border-stone-200 p-2 rounded-lg text-[#9c7a46]">
                <Landmark className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#9c7a46] tracking-wider uppercase leading-tight">Natyakriya</h3>
                <span className="text-[10px] uppercase font-bold tracking-widest text-stone-500">Kuchipudi Dance Academy</span>
              </div>
            </div>
            <p className="text-stone-555 font-light leading-relaxed text-xs sm:text-sm">
              Established with a deep commitment to preserving and celebrating traditional Kuchipudi classical dance forms. Our state-of-the-art studio offers comprehensive programs for kids, teens, and adults.
            </p>
            {/* Social channels */}
            <div className="flex space-x-3 pt-2 text-[#9c7a46]">
              <a href="#" className="hover:text-[#806130] transition-colors"><Instagram className="h-5 w-5" /></a>
              <a href="#" className="hover:text-[#806130] transition-colors"><Facebook className="h-5 w-5" /></a>
              <a href="#" className="hover:text-[#806130] transition-colors"><Youtube className="h-5 w-5" /></a>
            </div>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-serif font-bold text-[#9c7a46] text-sm uppercase tracking-wider border-b border-stone-200 pb-2">Academy Links</h4>
            <ul className="space-y-2 text-xs sm:text-sm">
              <li>
                <button onClick={() => { setCurrentTab('home'); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-stone-600 hover:text-[#9c7a46] hover:underline cursor-pointer">
                  Academy Home
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('biography'); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-stone-600 hover:text-[#9c7a46] hover:underline cursor-pointer">
                  Guru Biography & Lineage
                </button>
              </li>
              <li>
                <button onClick={() => { setCurrentTab('gallery'); window.scrollTo({top:0, behavior:'smooth'}); }} className="text-stone-600 hover:text-[#9c7a46] hover:underline cursor-pointer">
                  Media Library Gallery
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Contact quick facts */}
          <div className="md:col-span-4 space-y-4">
            <h4 className="font-serif font-bold text-[#9c7a46] text-sm uppercase tracking-wider border-b border-stone-200 pb-2">Academy Support</h4>
            <div className="space-y-3.5 text-xs font-light text-stone-650">
              <p className="flex items-start space-x-2.5">
                <MapPin className="h-4.5 w-4.5 text-[#9c7a46] shrink-0 mt-0.5" />
                <span>Near Pragathi Nagar, Hyderabad, India</span>
              </p>
              <p className="flex items-center space-x-2.5">
                <Phone className="h-4.5 w-4.5 text-[#9c7a46] shrink-0" />
                <span>+91 95736 92538</span>
              </p>
              <p className="flex items-center space-x-2.5 text-emerald-600">
                <svg className="h-4.5 w-4.5 text-emerald-600 shrink-0 fill-current" viewBox="0 0 24 24">
                  <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.04 1.012 11.45 1.01c-5.44 0-9.866 4.372-9.87 9.802 0 1.96.512 3.878 1.483 5.581l-.97 3.538 3.654-.955zm11.722-6.52c-.312-.156-1.848-.91-2.127-1.01-.279-.1-.482-.15-.68.15-.199.3-.77.97-.943 1.17-.173.201-.347.227-.66.071-1.127-.565-1.907-1.002-2.664-2.299-.199-.34-.199-.589-.043-.745.14-.14.312-.363.468-.545.156-.182.208-.312.312-.52.104-.207.052-.389-.026-.545-.078-.156-.682-1.642-.934-2.25-.246-.593-.497-.513-.68-.522-.177-.008-.379-.01-.58-.01-.202 0-.53.076-.807.379-.278.303-1.062 1.037-1.062 2.529 0 1.492 1.085 2.932 1.236 3.134.152.202 2.137 3.262 5.176 4.57.722.311 1.285.498 1.724.638.725.23 1.385.197 1.905.12.58-.088 1.848-.756 2.11-1.45.263-.693.263-1.287.185-1.411-.078-.124-.279-.201-.59-.356z" />
                </svg>
                <a 
                  href="https://wa.me/919573692538?text=Hello%20Natyakriya%20Academy%2C%20I%20am%20interested%20in%20Kuchipudi%20classes." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="hover:text-green-600 hover:underline font-medium"
                >
                  WhatsApp Chat Contact
                </a>
              </p>
              <p className="flex items-center space-x-2.5">
                <Mail className="h-4.5 w-4.5 text-[#9c7a46] shrink-0" />
                <span>admissions@natyakriyaacademy.org</span>
              </p>
            </div>
          </div>

        </div>

        {/* Lower legal strip */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 border-t border-stone-200 mt-12 pt-8 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-y-3">
          <p>© {new Date().getFullYear()} Natyakriya Academy. All Rights Reserved. Preserving Guru-Shishya Parampara.</p>
          <div className="flex space-x-4 items-center">
            <span>Designed with Heart & Devotion</span>
            <span>•</span>
            <button 
              onClick={() => {
                if (isAdmin) {
                  setCurrentTab('admin');
                } else {
                  setCurrentTab('login');
                }
                window.scrollTo({top:0, behavior:'smooth'});
              }}
              className="text-[#9c7a46] hover:text-[#806130] hover:underline font-semibold cursor-pointer"
            >
              Owner Login
            </button>
          </div>
        </div>
      </footer>

      {/* Floating WhatsApp Contact Button */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end pointer-events-none">
        {/* Decorative subtle tip balloon */}
        <span className="mb-2 mr-1 px-3 py-1 bg-[#150f0d] border border-[#3d2b1f] text-xs font-medium text-emerald-400 rounded-lg shadow-lg pointer-events-auto select-none animate-bounce flex items-center space-x-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
          <span>Chat on WhatsApp</span>
        </span>
        
        <a 
          href="https://wa.me/919573692538?text=Hello%20Natyakriya%20Academy%2C%20I%20am%20interested%20in%20Kuchipudi%20classes." 
          target="_blank" 
          rel="noopener noreferrer"
          className="pointer-events-auto flex items-center justify-center bg-[#25D366] hover:bg-[#22c35e] text-white p-3.5 sm:px-4 sm:py-3 rounded-full shadow-2xl transition-all duration-300 hover:scale-110 active:scale-95 group relative"
          title="Contact via WhatsApp"
        >
          {/* Pulsing glow ring */}
          <span className="absolute inset-0 rounded-full bg-[#25D366]/40 animate-ping opacity-75 -z-10 group-hover:bg-[#22c35e]/60"></span>
          
          <svg className="h-6 w-6 shrink-0 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.04 1.012 11.45 1.01c-5.44 0-9.866 4.372-9.87 9.802 0 1.96.512 3.878 1.483 5.581l-.97 3.538 3.654-.955zm11.722-6.52c-.312-.156-1.848-.91-2.127-1.01-.279-.1-.482-.15-.68.15-.199.3-.77.97-.943 1.17-.173.201-.347.227-.66.071-1.127-.565-1.907-1.002-2.664-2.299-.199-.34-.199-.589-.043-.745.14-.14.312-.363.468-.545.156-.182.208-.312.312-.52.104-.207.052-.389-.026-.545-.078-.156-.682-1.642-.934-2.25-.246-.593-.497-.513-.68-.522-.177-.008-.379-.01-.58-.01-.202 0-.53.076-.807.379-.278.303-1.062 1.037-1.062 2.529 0 1.492 1.085 2.932 1.236 3.134.152.202 2.137 3.262 5.176 4.57.722.311 1.285.498 1.724.638.725.23 1.385.197 1.905.12.58-.088 1.848-.756 2.11-1.45.263-.693.263-1.287.185-1.411-.078-.124-.279-.201-.59-.356z" />
          </svg>
          <span className="hidden sm:inline-block font-sans font-bold text-sm ml-2">Chat with Owners</span>
        </a>
      </div>

    </div>
  );
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, Check, Clock as ClockIcon, Calendar, UserCheck, 
  Image as ImageIcon, Video, BookOpen, Film, CheckCircle, Eye, 
  Sparkles, ListCollapse, AlertCircle, Upload, ArrowRight
} from 'lucide-react';
import { ClassSchedule, GalleryItem, Registration } from '../types';

interface AdminPanelProps {
  schedules: ClassSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<ClassSchedule[]>>;
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
}

export default function AdminPanel({
  schedules, setSchedules,
  galleryItems, setGalleryItems,
  registrations, setRegistrations
}: AdminPanelProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'registrations' | 'media' | 'classes'>('registrations');

  // Success/Error notifications
  const [noti, setNoti] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // File states for Media tab
  const [mediaDesc, setMediaDesc] = useState('');
  const [mediaCategory, setMediaCategory] = useState<'Performance' | 'Classroom' | 'Festival' | 'Workshop'>('Performance');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Custom Deletion Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'media' | 'registration' | 'class';
    id: string;
    title: string;
  } | null>(null);

  // Forms for Class Schedule
  const [newClass, setNewClass] = useState({
    className: '',
    level: 'Beginner' as const,
    ageGroup: 'Kids (Ages 6-11)',
    instructor: 'Guru Srimayi Devi',
    dayOfWeek: 'Saturday' as const,
    timeSlot: '09:00 AM - 10:30 AM',
    duration: '90 Minutes',
    description: '',
    maxStudents: 15
  });

  const triggerNotification = (type: 'success' | 'error', message: string) => {
    setNoti({ type, message });
    setTimeout(() => {
      setNoti(null);
    }, 4000);
  };

  // Helper to compress images on the client side
  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const max_size = 800; // Optimal display boundary

          if (width > height) {
            if (width > max_size) {
              height *= max_size / width;
              width = max_size;
            }
          } else {
            if (height > max_size) {
              width *= max_size / height;
              height = max_size;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            // Save as JPEG with 75% quality to save space
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.75);
            resolve(compressedBase64);
          } else {
            resolve(event.target?.result as string);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image source'));
        img.src = event.target?.result as string;
      };
      reader.onerror = () => reject(new Error('FileReader error'));
      reader.readAsDataURL(file);
    });
  };

  // File change handler
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      triggerNotification('error', 'Please select a valid image file.');
      return;
    }

    setMediaFile(selected);
    setIsCompressing(true);
    
    try {
      const compressedDataUrl = await compressImage(selected);
      setMediaFilePreview(compressedDataUrl);
      setMediaUrlInput(''); // clear text URL input
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Failed to compress image.');
    } finally {
      setIsCompressing(false);
    }
  };

  // Media submission
  const handleAddMedia = (e: React.FormEvent) => {
    e.preventDefault();

    let finalUrl = '';
    if (mediaType === 'image') {
      if (mediaFilePreview) {
        finalUrl = mediaFilePreview;
      } else if (mediaUrlInput.trim()) {
        finalUrl = mediaUrlInput.trim();
      } else {
        triggerNotification('error', 'Please upload an image file or provide an image link.');
        return;
      }
    } else {
      // Video
      if (!mediaUrlInput.trim()) {
        triggerNotification('error', 'Please provide a YouTube embed video URL.');
        return;
      }
      // Clean YouTube link to embed format if needed
      let rawUrl = mediaUrlInput.trim();
      if (rawUrl.includes('youtube.com/watch?v=')) {
        const videoId = rawUrl.split('v=')[1]?.split('&')[0];
        rawUrl = `https://www.youtube.com/embed/${videoId}`;
      } else if (rawUrl.includes('youtu.be/')) {
        const videoId = rawUrl.split('youtu.be/')[1]?.split('?')[0];
        rawUrl = `https://www.youtube.com/embed/${videoId}`;
      }
      finalUrl = rawUrl;
    }

    const newItem: GalleryItem = {
      id: `media-custom-${Date.now()}`,
      title: `${mediaCategory} Showcase`,
      description: '',
      category: mediaCategory,
      type: mediaType,
      url: finalUrl,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    setGalleryItems(prev => [newItem, ...prev]);
    triggerNotification('success', `New ${mediaType} added to gallery successfully!`);

    // Reset fields
    setMediaDesc('');
    setMediaUrlInput('');
    setMediaFile(null);
    setMediaFilePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Execute Delete after confirmation
  const executeDelete = () => {
    if (!deleteConfirm) return;

    const { type, id } = deleteConfirm;
    if (type === 'media') {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
      triggerNotification('success', 'Media item removed successfully.');
    } else if (type === 'registration') {
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      triggerNotification('success', 'Registration record deleted.');
    } else if (type === 'class') {
      setSchedules(prev => prev.filter(c => c.id !== id));
      triggerNotification('success', 'Course schedule deleted.');
    }

    setDeleteConfirm(null);
  };

  // Delete Media
  const handleDeleteMedia = (id: string, title: string) => {
    setDeleteConfirm({ type: 'media', id, title });
  };

  // Status Change for Student Registrations
  const updateRegistrationStatus = (id: string, newStatus: 'Approved' | 'Contacted') => {
    setRegistrations(prev => prev.map(reg => {
      if (reg.id === id) {
        return { ...reg, status: newStatus };
      }
      return reg;
    }));
    triggerNotification('success', `Registration updated to ${newStatus}.`);
  };

  // Delete Registration
  const handleDeleteRegistration = (id: string, title: string) => {
    setDeleteConfirm({ type: 'registration', id, title });
  };

  // Class Schedule submit
  const handleAddClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClass.className.trim() || !newClass.description.trim()) {
      triggerNotification('error', 'Please fill in course name and description.');
      return;
    }

    const item: ClassSchedule = {
      ...newClass,
      id: `class-custom-${Date.now()}`,
      registeredCount: 0
    };

    setSchedules(prev => [...prev, item]);
    triggerNotification('success', `New course '${newClass.className}' added successfully.`);
    setNewClass({
      className: '',
      level: 'Beginner',
      ageGroup: 'Kids (Ages 6-11)',
      instructor: 'Guru Srimayi Devi',
      dayOfWeek: 'Saturday',
      timeSlot: '09:00 AM - 10:30 AM',
      duration: '90 Minutes',
      description: '',
      maxStudents: 15
    });
  };

  // Delete Class
  const handleDeleteClass = (id: string, title: string) => {
    setDeleteConfirm({ type: 'class', id, title });
  };

  return (
    <div className="bg-[#faf9f6] min-h-[80vh] py-10 sm:py-14 text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Title */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-stone-200 pb-6 mb-10 gap-y-4">
          <div>
            <span className="text-[#9c7a46] text-xs font-mono font-bold tracking-widest uppercase bg-[#9c7a46]/10 px-2.5 py-1 rounded-md inline-block mb-2 border border-[#9c7a46]/20">
              Academy Owners Portal
            </span>
            <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-[#9c7a46] tracking-tight">
              Administration Dashboard
            </h1>
          </div>
          
          {/* Quick Stats Summary */}
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="bg-white border border-stone-200 py-2.5 px-4 rounded-xl shadow-xs">
              <span className="text-stone-500 block font-light">Enrollment Inquiries</span>
              <span className="text-lg font-bold text-[#9c7a46] font-mono">{registrations.length}</span>
            </div>
            <div className="bg-white border border-stone-200 py-2.5 px-4 rounded-xl shadow-xs">
              <span className="text-stone-500 block font-light">Active Courses</span>
              <span className="text-lg font-bold text-[#9c7a46] font-mono">{schedules.length}</span>
            </div>
            <div className="bg-white border border-stone-200 py-2.5 px-4 rounded-xl shadow-xs">
              <span className="text-stone-500 block font-light">Media Gallery</span>
              <span className="text-lg font-bold text-[#9c7a46] font-mono">{galleryItems.length}</span>
            </div>
          </div>
        </div>

        {/* Floating Notifications */}
        {noti && (
          <div className={`fixed bottom-6 right-6 z-50 flex items-center space-x-2.5 p-4 rounded-xl shadow-xl border animate-slide-in-up text-sm font-medium ${
            noti.type === 'success' 
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800 backdrop-blur-md' 
              : 'bg-rose-50 border-rose-200 text-rose-850 backdrop-blur-md'
          }`}>
            {noti.type === 'success' ? <CheckCircle className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
            <span>{noti.message}</span>
          </div>
        )}

        {/* Dashboard layout with left-hand sub nav and content frame */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left panel selection (3 Columns) */}
          <div className="lg:col-span-3 space-y-2">
            {[
              { id: 'registrations', label: 'Enrollment Inquiries', count: registrations.length, icon: UserCheck },
              { id: 'media', label: 'Gallery Daily Uploads', count: galleryItems.length, icon: ImageIcon },
              { id: 'classes', label: 'Schedules & Courses', count: schedules.length, icon: BookOpen },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold tracking-wide transition-all border cursor-pointer ${
                    isActive
                      ? 'bg-[#c5a059] text-white border-[#c5a059] shadow-xs font-bold'
                      : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-[#9c7a46]'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="h-4.5 w-4.5" />
                    <span>{tab.label}</span>
                  </div>
                  <span className={`text-xs font-mono py-0.5 px-2 rounded-full font-bold ${
                    isActive ? 'bg-black/10 text-white' : 'bg-stone-100 text-stone-600 border border-stone-200'
                  }`}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Right panel output frame (9 Columns) */}
          <div className="lg:col-span-9 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs text-stone-800">
            
            {/* 1. REGISTRATIONS PANEL */}
            {activeSubTab === 'registrations' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#9c7a46]">
                    Admissions & Enrollment Inquiries
                  </h3>
                  <p className="text-stone-400 font-light text-xs sm:text-sm mt-1">
                    Manage incoming student signups, contact parents, or approve their registrations for the classes.
                  </p>
                </div>

                {registrations.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-[#3d2b1f] rounded-xl bg-[#1a1412]">
                    <UserCheck className="h-10 w-10 text-stone-500 mx-auto mb-3" />
                    <p className="text-stone-400 text-sm font-light">No registrations logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {registrations.map((reg) => (
                      <div 
                        key={reg.id} 
                        className="border border-[#3d2b1f] bg-[#1a1412]/50 rounded-xl p-5 hover:bg-[#1a1412]/80 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2">
                          <div>
                            <span className="text-[10px] font-mono text-stone-500 font-bold">Registered: {reg.registrationDate}</span>
                            <h4 className="font-serif text-lg font-bold text-white mt-0.5">
                              {reg.studentName} <span className="font-sans text-xs text-stone-400 font-medium">({reg.age} years)</span>
                            </h4>
                          </div>

                          {/* Status pill */}
                          <div className="flex items-center space-x-2">
                            <span className={`px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full ${
                              reg.status === 'Pending' ? 'bg-amber-950/40 text-amber-400 border border-amber-500/20' :
                              reg.status === 'Approved' ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/20' :
                              'bg-indigo-950/40 text-indigo-400 border border-indigo-500/20'
                            }`}>
                              {reg.status}
                            </span>
                          </div>
                        </div>

                        {/* Inquiry Details Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs text-stone-300 border-y border-[#3d2b1f] py-3.5">
                          <div>
                            <span className="block text-[10px] text-stone-500 uppercase font-bold">Requested Course:</span>
                            <span className="font-semibold text-[#c5a059]">{reg.selectedClassName}</span>
                          </div>
                          <div>
                            <span className="block text-[10px] text-stone-500 uppercase font-bold">Contact Info:</span>
                            <span className="font-semibold text-white">{reg.phone} • {reg.email}</span>
                          </div>
                          {reg.parentName && (
                            <div className="sm:col-span-2">
                              <span className="block text-[10px] text-stone-500 uppercase font-bold">Parent / Guardian:</span>
                              <span className="font-semibold text-white">{reg.parentName}</span>
                            </div>
                          )}
                          <div>
                            <span className="block text-[10px] text-stone-500 uppercase font-bold">Prior Dance Training:</span>
                            <span className="font-semibold text-white">{reg.experience}</span>
                          </div>
                          {reg.notes && (
                            <div className="sm:col-span-2 mt-1">
                              <span className="block text-[10px] text-stone-500 uppercase font-bold">Additional Notes:</span>
                              <p className="text-stone-400 italic mt-0.5 font-light">"{reg.notes}"</p>
                            </div>
                          )}
                        </div>

                        {/* Actions line */}
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => handleDeleteRegistration(reg.id, reg.studentName)}
                            className="p-2 text-rose-400 hover:bg-rose-950/30 rounded-lg transition-colors cursor-pointer border border-transparent hover:border-rose-500/15"
                            title="Delete inquiry"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>

                          <div className="flex space-x-2">
                            {reg.status !== 'Contacted' && (
                              <button
                                onClick={() => updateRegistrationStatus(reg.id, 'Contacted')}
                                className="px-3 py-1.5 border border-[#3d2b1f] bg-[#150f0d] hover:bg-[#1a1412] text-xs font-semibold text-[#c5a059] rounded-lg transition-all cursor-pointer"
                              >
                                Mark Contacted
                              </button>
                            )}
                            {reg.status !== 'Approved' && (
                              <button
                                onClick={() => updateRegistrationStatus(reg.id, 'Approved')}
                                className="px-3 py-1.5 bg-[#c5a059] text-[#150f0d] text-xs font-bold rounded-lg transition-all cursor-pointer"
                              >
                                Approve Enrollment
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* 2. MEDIA DAILY UPLOADS PANEL */}
            {activeSubTab === 'media' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#c5a059]">
                    Add New Media to Gallery
                  </h3>
                  <p className="text-stone-400 font-light text-xs sm:text-sm mt-1">
                    Upload images daily of your dance sessions, classes, workshops, or stages. Images will automatically be compressed to remain lightweight!
                  </p>
                </div>

                {/* Main add form */}
                <form onSubmit={handleAddMedia} className="space-y-5 bg-[#1a1412]/40 border border-[#3d2b1f] p-6 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Media Type */}
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Media Category type
                      </label>
                      <div className="flex space-x-4">
                        <button
                          type="button"
                          onClick={() => {
                            setMediaType('image');
                            setMediaUrlInput('');
                          }}
                          className={`flex-1 py-2 px-3 border rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            mediaType === 'image'
                              ? 'bg-[#c5a059] text-[#150f0d] border-[#c5a059]'
                              : 'bg-[#150f0d] text-stone-400 border-[#3d2b1f] hover:text-[#c5a059] hover:bg-[#1a1412]'
                          }`}
                        >
                          <ImageIcon className="h-4 w-4" />
                          <span>Photo</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setMediaType('video');
                            setMediaFile(null);
                            setMediaFilePreview(null);
                          }}
                          className={`flex-1 py-2 px-3 border rounded-lg text-xs font-bold uppercase tracking-wider flex items-center justify-center space-x-2 transition-all cursor-pointer ${
                            mediaType === 'video'
                              ? 'bg-[#c5a059] text-[#150f0d] border-[#c5a059]'
                              : 'bg-[#150f0d] text-stone-400 border-[#3d2b1f] hover:text-[#c5a059] hover:bg-[#1a1412]'
                          }`}
                        >
                          <Video className="h-4 w-4" />
                          <span>Video</span>
                        </button>
                      </div>
                    </div>

                    {/* Category */}
                    <div className="space-y-1.5">
                      <label htmlFor="mediaCategory" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Gallery Section Category
                      </label>
                      <select
                        id="mediaCategory"
                        value={mediaCategory}
                        onChange={(e: any) => setMediaCategory(e.target.value)}
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-xs focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-semibold"
                      >
                        <option value="Performance">Performance Stage</option>
                        <option value="Classroom">Classroom Rehearsal</option>
                        <option value="Festival">Festival Celebration</option>
                        <option value="Workshop">Masterclass Workshop</option>
                      </select>
                    </div>
                  </div>

                  {/* Media uploads selection */}
                  {mediaType === 'image' ? (
                    <div className="space-y-4 pt-2 border-t border-[#3d2b1f]">
                      
                      {/* Image uploader area */}
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                          Upload Image File (Compresses Automatically)
                        </label>
                        
                        <div className="flex flex-col sm:flex-row items-center gap-4">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-3 bg-[#1a1412] border border-[#3d2b1f] text-[#c5a059] rounded-lg text-xs font-bold uppercase tracking-wider flex items-center space-x-2 shadow-xs hover:bg-[#261e1a] cursor-pointer"
                          >
                            <Upload className="h-4 w-4" />
                            <span>Choose Image file</span>
                          </button>
                          
                          <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                          />
                          
                          <span className="text-xs text-stone-400 font-light">
                            {mediaFile ? `Selected: ${mediaFile.name}` : "Or paste a direct URL link below instead."}
                          </span>
                        </div>
                      </div>

                      {/* URL input fallback */}
                      {!mediaFilePreview && (
                        <div className="space-y-1.5">
                          <label htmlFor="mediaUrlInput" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                            Or paste Direct Image URL
                          </label>
                          <input
                            type="text"
                            id="mediaUrlInput"
                            value={mediaUrlInput}
                            onChange={(e) => {
                              setMediaUrlInput(e.target.value);
                              setMediaFile(null);
                              setMediaFilePreview(null);
                            }}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-mono text-xs"
                          />
                        </div>
                      )}

                      {/* Compress feedback or preview */}
                      {isCompressing && (
                        <div className="flex items-center space-x-2 text-xs text-amber-400 bg-amber-950/40 border border-amber-500/20 p-2.5 rounded-lg">
                          <div className="animate-spin rounded-full h-3.5 w-3.5 border border-amber-400 border-t-transparent" />
                          <span>Compressing & optimizing image memory size...</span>
                        </div>
                      )}

                      {mediaFilePreview && (
                        <div className="space-y-2">
                          <span className="block text-xs font-bold text-emerald-400">✓ Image ready for upload (Compressed base64 cached)</span>
                          <div className="relative w-36 h-36 border border-[#3d2b1f] rounded-lg overflow-hidden bg-[#1a1412]">
                            <img src={mediaFilePreview} alt="Preview" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                setMediaFile(null);
                                setMediaFilePreview(null);
                                if (fileInputRef.current) fileInputRef.current.value = '';
                              }}
                              className="absolute top-1 right-1 bg-black/60 text-white p-1 rounded-full hover:bg-black"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )}

                    </div>
                  ) : (
                    // Video URL input only
                    <div className="space-y-1.5 pt-2 border-t border-[#3d2b1f]">
                      <label htmlFor="mediaUrlInput" className="block text-xs font-bold text-[#c5a059] uppercase tracking-wide">
                        YouTube Link URL *
                      </label>
                      <input
                        type="text"
                        id="mediaUrlInput"
                        value={mediaUrlInput}
                        onChange={(e) => setMediaUrlInput(e.target.value)}
                        placeholder="https://www.youtube.com/watch?v=..."
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-mono text-xs"
                      />
                      <span className="block text-[10px] text-stone-500 font-light mt-0.5">We'll automatically format this to allow secure frame embedding.</span>
                    </div>
                  )}

                  {/* Save Trigger */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isCompressing}
                      className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-[#150f0d] text-xs font-bold tracking-wider uppercase rounded-lg shadow-sm transition-colors cursor-pointer"
                    >
                      Add Media Item
                    </button>
                  </div>
                </form>

                {/* View/Delete Active list */}
                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[#c5a059] border-b border-[#3d2b1f] pb-2">
                    Gallery Inventory Manager
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="flex items-center space-x-3 p-3 border border-[#3d2b1f] rounded-xl bg-[#1a1412]/50 hover:bg-[#1a1412] hover:shadow-md transition-all text-[#e5e1da]">
                        <div className="w-12 h-12 bg-stone-900 rounded-lg overflow-hidden shrink-0">
                          <img src={item.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h5 className="text-xs font-bold text-white truncate font-serif">{item.title}</h5>
                          <span className="block text-[10px] text-[#c5a059] font-semibold uppercase font-mono">{item.category} • {item.type}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteMedia(item.id, item.title)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 rounded-md hover:bg-[#261e1a] transition-colors cursor-pointer shrink-0"
                          title="Remove from gallery"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 3. SCHEDULES PANEL */}
            {activeSubTab === 'classes' && (
              <div className="space-y-8">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#c5a059]">
                    Add New Course Schedule
                  </h3>
                  <p className="text-stone-400 font-light text-xs sm:text-sm mt-1">
                    Introduce a new dance class syllabus, timings, maximum capacity, or instructor profiles.
                  </p>
                </div>

                <form onSubmit={handleAddClass} className="space-y-5 bg-[#1a1412]/40 border border-[#3d2b1f] p-6 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Class Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="className" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        id="className"
                        value={newClass.className}
                        onChange={(e) => setNewClass(prev => ({ ...prev, className: e.target.value }))}
                        placeholder="e.g. Tarangam Intensive Class"
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Level */}
                    <div className="space-y-1.5">
                      <label htmlFor="classLevel" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Difficulty Level
                      </label>
                      <select
                        id="classLevel"
                        value={newClass.level}
                        onChange={(e: any) => setNewClass(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-xs focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-semibold"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                        <option value="All Levels">All Levels</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Age group */}
                    <div className="space-y-1.5">
                      <label htmlFor="ageGroup" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Target Age Group
                      </label>
                      <input
                        type="text"
                        id="ageGroup"
                        value={newClass.ageGroup}
                        onChange={(e) => setNewClass(prev => ({ ...prev, ageGroup: e.target.value }))}
                        placeholder="Kids (Ages 6-11)"
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Instructor */}
                    <div className="space-y-1.5">
                      <label htmlFor="instructor" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        id="instructor"
                        value={newClass.instructor}
                        onChange={(e) => setNewClass(prev => ({ ...prev, instructor: e.target.value }))}
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-medium"
                      />
                    </div>

                    {/* Max Students */}
                    <div className="space-y-1.5">
                      <label htmlFor="maxStudents" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        id="maxStudents"
                        min="1"
                        max="50"
                        value={newClass.maxStudents}
                        onChange={(e) => setNewClass(prev => ({ ...prev, maxStudents: Number(e.target.value) }))}
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Day of Week */}
                    <div className="space-y-1.5">
                      <label htmlFor="dayOfWeek" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Day of Week
                      </label>
                      <select
                        id="dayOfWeek"
                        value={newClass.dayOfWeek}
                        onChange={(e: any) => setNewClass(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-xs focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-semibold"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Time slot */}
                    <div className="space-y-1.5">
                      <label htmlFor="timeSlot" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Time Slot *
                      </label>
                      <input
                        type="text"
                        id="timeSlot"
                        value={newClass.timeSlot}
                        onChange={(e) => setNewClass(prev => ({ ...prev, timeSlot: e.target.value }))}
                        placeholder="05:00 PM - 06:30 PM"
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                      <label htmlFor="duration" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                        Session Duration
                      </label>
                      <input
                        type="text"
                        id="duration"
                        value={newClass.duration}
                        onChange={(e) => setNewClass(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="90 Minutes"
                        className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label htmlFor="classDesc" className="block text-xs font-bold text-stone-300 uppercase tracking-wide">
                      Syllabus & Course Description *
                    </label>
                    <textarea
                      id="classDesc"
                      rows={3}
                      value={newClass.description}
                      onChange={(e) => setNewClass(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Outline the steps, posture focus, and items taught in this class."
                      className="w-full px-4 py-2 bg-[#1a1412] text-white border border-[#3d2b1f] rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                    />
                  </div>

                  <div>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-[#150f0d] text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
                    >
                      Save Course Schedule
                    </button>
                  </div>
                </form>

                {/* List classes manager */}
                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[#c5a059] border-b border-[#3d2b1f] pb-2">
                    Active Schedules
                  </h4>

                  <div className="space-y-3">
                    {schedules.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 border border-[#3d2b1f] rounded-xl bg-[#1a1412]/50 hover:bg-[#1a1412] transition-all text-xs text-[#e5e1da]">
                        <div>
                          <h5 className="font-serif font-bold text-white text-sm">{c.className}</h5>
                          <span className="text-stone-400">{c.dayOfWeek}s at {c.timeSlot} • Instructor: {c.instructor}</span>
                        </div>
                        <button
                          onClick={() => handleDeleteClass(c.id, c.className)}
                          className="p-1.5 text-stone-500 hover:text-rose-400 rounded-md hover:bg-[#261e1a] transition-colors cursor-pointer shrink-0"
                          title="Delete schedule"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm">
          <div className="bg-[#150f0d] border border-[#3d2b1f] p-6 rounded-2xl max-w-md w-full shadow-2xl relative">
            <div className="flex items-start space-x-4">
              <div className="bg-rose-950/40 p-3 rounded-full text-rose-500 shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-bold text-[#c5a059] mb-1">
                  Confirm Deletion
                </h3>
                <p className="text-stone-300 text-sm font-light leading-relaxed mb-4">
                  Are you sure you want to delete <span className="font-bold text-white font-serif">"{deleteConfirm.title}"</span>? This action is permanent and cannot be undone.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-[#3d2b1f] bg-[#1a1412] hover:bg-[#211a17] text-xs font-semibold text-stone-400 hover:text-white rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer uppercase tracking-wider flex items-center space-x-1.5 shadow-md"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Delete Permanently</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

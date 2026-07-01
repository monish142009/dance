/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { 
  Plus, Trash2, Check, Clock as ClockIcon, Calendar, UserCheck, 
  Image as ImageIcon, Video, BookOpen, Film, CheckCircle, Eye, 
  Sparkles, ListCollapse, AlertCircle, Upload, ArrowRight, Edit3, X, Save,
  Award
} from 'lucide-react';
import { db } from '../firebase';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { ClassSchedule, GalleryItem, Registration, InstructorProfile } from '../types';

interface AdminPanelProps {
  schedules: ClassSchedule[];
  setSchedules: React.Dispatch<React.SetStateAction<ClassSchedule[]>>;
  galleryItems: GalleryItem[];
  setGalleryItems: React.Dispatch<React.SetStateAction<GalleryItem[]>>;
  registrations: Registration[];
  setRegistrations: React.Dispatch<React.SetStateAction<Registration[]>>;
  teachers: InstructorProfile[];
  setTeachers: React.Dispatch<React.SetStateAction<InstructorProfile[]>>;
}

export default function AdminPanel({
  schedules, setSchedules,
  galleryItems, setGalleryItems,
  registrations, setRegistrations,
  teachers, setTeachers
}: AdminPanelProps) {
  
  const [activeSubTab, setActiveSubTab] = useState<'registrations' | 'media' | 'classes' | 'awards'>('registrations');

  // Success/Error notifications
  const [noti, setNoti] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Guru & Awards states
  const [selectedTeacherIdx, setSelectedTeacherIdx] = useState<number>(0);
  const [newAwardYear, setNewAwardYear] = useState<string>('');
  const [newAwardTitle, setNewAwardTitle] = useState<string>('');
  const [newAwardOrganization, setNewAwardOrganization] = useState<string>('');

  // New Guru state
  const [showNewGuruForm, setShowNewGuruForm] = useState<boolean>(false);
  const [newGuruName, setNewGuruName] = useState<string>('');
  const [newGuruTitle, setNewGuruTitle] = useState<string>('');
  const [newGuruBio, setNewGuruBio] = useState<string>('');
  const [newGuruImageUrl, setNewGuruImageUrl] = useState<string>('');
  const [newGuruTraining, setNewGuruTraining] = useState<string>('');

  // Edit Guru state
  const [isEditingGuru, setIsEditingGuru] = useState<boolean>(false);
  const [editGuruName, setEditGuruName] = useState<string>('');
  const [editGuruTitle, setEditGuruTitle] = useState<string>('');
  const [editGuruBio, setEditGuruBio] = useState<string>('');
  const [editGuruImageUrl, setEditGuruImageUrl] = useState<string>('');
  const [editGuruTraining, setEditGuruTraining] = useState<string>('');

  // File states for Guru profiles
  const [newGuruImageFile, setNewGuruImageFile] = useState<File | null>(null);
  const [newGuruImageFilePreview, setNewGuruImageFilePreview] = useState<string | null>(null);
  const [editGuruImageFile, setEditGuruImageFile] = useState<File | null>(null);
  const [editGuruImageFilePreview, setEditGuruImageFilePreview] = useState<string | null>(null);
  const [isGuruImageCompressing, setIsGuruImageCompressing] = useState<boolean>(false);
  const newGuruFileInputRef = useRef<HTMLInputElement>(null);
  const editGuruFileInputRef = useRef<HTMLInputElement>(null);

  // File states for Media tab
  const [mediaDesc, setMediaDesc] = useState('');
  const [mediaCategory, setMediaCategory] = useState<'Performance' | 'Classroom' | 'Festival' | 'Workshop'>('Performance');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [mediaUrlInput, setMediaUrlInput] = useState('');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaFilePreview, setMediaFilePreview] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // EDIT STATE: Registrations
  const [editingRegId, setEditingRegId] = useState<string | null>(null);
  const [editingRegData, setEditingRegData] = useState<Registration | null>(null);

  // MANUAL REGISTRATION ADD STATE
  const [showManualRegForm, setShowManualRegForm] = useState(false);
  const [manualRegData, setManualRegData] = useState({
    studentName: '',
    age: '',
    parentName: '',
    email: '',
    phone: '',
    selectedClassId: '',
    experience: 'None',
    notes: '',
    status: 'Approved' as 'Pending' | 'Approved' | 'Contacted'
  });

  // EDIT STATE: Class Schedules
  const [editingClassId, setEditingClassId] = useState<string | null>(null);

  // EDIT STATE: Gallery Items
  const [editingMediaId, setEditingMediaId] = useState<string | null>(null);
  const [editingMediaData, setEditingMediaData] = useState<GalleryItem | null>(null);

  // Custom Deletion Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: 'media' | 'registration' | 'class';
    id: string;
    title: string;
  } | null>(null);

  // Forms for Class Schedule (handles both Add and Edit)
  const [classForm, setClassForm] = useState({
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
    if (mediaFilePreview) {
      finalUrl = mediaFilePreview;
    } else if (mediaUrlInput.trim()) {
      finalUrl = mediaUrlInput.trim();
    } else {
      triggerNotification('error', 'Please upload an image file or provide an image link.');
      return;
    }

    const newItem: GalleryItem = {
      id: `media-custom-${Date.now()}`,
      title: `${mediaCategory} Showcase`,
      description: '',
      category: mediaCategory,
      type: 'image',
      url: finalUrl,
      date: new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    };

    setGalleryItems(prev => [newItem, ...prev]);
    setDoc(doc(db, "gallery", newItem.id), newItem).catch(err => console.error("Error saving media to Firestore:", err));
    triggerNotification('success', 'New item added to gallery successfully!');

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
      deleteDoc(doc(db, "gallery", id)).catch(err => console.error("Error deleting media from Firestore:", err));
      triggerNotification('success', 'Media item removed successfully.');
    } else if (type === 'registration') {
      setRegistrations(prev => prev.filter(reg => reg.id !== id));
      deleteDoc(doc(db, "registrations", id)).catch(err => console.error("Error deleting registration from Firestore:", err));
      triggerNotification('success', 'Registration record deleted.');
    } else if (type === 'class') {
      setSchedules(prev => prev.filter(c => c.id !== id));
      deleteDoc(doc(db, "schedules", id)).catch(err => console.error("Error deleting schedule from Firestore:", err));
      triggerNotification('success', 'Course schedule deleted.');
    }

    setDeleteConfirm(null);
  };

  // Add Award / Honor to Selected Guru
  const handleAddAward = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAwardYear || !newAwardTitle || !newAwardOrganization) {
      triggerNotification('error', 'Please fill in all award fields.');
      return;
    }

    const updatedTeachers = [...teachers];
    const currentGuru = updatedTeachers[selectedTeacherIdx];
    if (!currentGuru) return;

    const newAward = {
      year: newAwardYear,
      title: newAwardTitle,
      organization: newAwardOrganization
    };

    // Initialize awards array if undefined
    const currentAwards = currentGuru.awards ? [...currentGuru.awards] : [];
    
    // Insert at the top of awards list
    currentAwards.unshift(newAward);

    currentGuru.awards = currentAwards;
    updatedTeachers[selectedTeacherIdx] = currentGuru;

    setTeachers(updatedTeachers);
    const docId = currentGuru.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    setDoc(doc(db, "teachers", docId), currentGuru).catch(err => console.error("Error updating teacher in Firestore:", err));
    triggerNotification('success', `Added "${newAwardTitle}" to ${currentGuru.name}'s profile successfully!`);

    // Reset fields
    setNewAwardYear('');
    setNewAwardTitle('');
    setNewAwardOrganization('');
  };

  // Remove Award / Honor from Selected Guru
  const handleRemoveAward = (guruIdx: number, awardIdx: number) => {
    const updatedTeachers = [...teachers];
    const currentGuru = updatedTeachers[guruIdx];
    if (!currentGuru || !currentGuru.awards) return;

    const removedAwardTitle = currentGuru.awards[awardIdx].title;
    const currentAwards = [...currentGuru.awards];
    currentAwards.splice(awardIdx, 1);

    currentGuru.awards = currentAwards;
    updatedTeachers[guruIdx] = currentGuru;

    setTeachers(updatedTeachers);
    const docId = currentGuru.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    setDoc(doc(db, "teachers", docId), currentGuru).catch(err => console.error("Error updating teacher in Firestore:", err));
    triggerNotification('success', `Removed "${removedAwardTitle}" award.`);
  };

  // File change handler for Register Guru
  const handleNewGuruFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      triggerNotification('error', 'Please select a valid image file.');
      return;
    }

    setNewGuruImageFile(selected);
    setIsGuruImageCompressing(true);
    
    try {
      const compressedDataUrl = await compressImage(selected);
      setNewGuruImageFilePreview(compressedDataUrl);
      setNewGuruImageUrl(''); // clear text URL input
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Failed to compress image.');
    } finally {
      setIsGuruImageCompressing(false);
    }
  };

  // File change handler for Edit Guru
  const handleEditGuruFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      triggerNotification('error', 'Please select a valid image file.');
      return;
    }

    setEditGuruImageFile(selected);
    setIsGuruImageCompressing(true);
    
    try {
      const compressedDataUrl = await compressImage(selected);
      setEditGuruImageFilePreview(compressedDataUrl);
      setEditGuruImageUrl(''); // clear text URL input
    } catch (err) {
      console.error(err);
      triggerNotification('error', 'Failed to compress image.');
    } finally {
      setIsGuruImageCompressing(false);
    }
  };

  // Add a brand new Guru/Faculty profile
  const handleAddGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGuruName || !newGuruTitle || !newGuruBio) {
      triggerNotification('error', 'Guru Name, Title, and Bio are required.');
      return;
    }

    const defaultImg = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800";
    let finalImgUrl = defaultImg;
    if (newGuruImageFilePreview) {
      finalImgUrl = newGuruImageFilePreview;
    } else if (newGuruImageUrl.trim()) {
      finalImgUrl = newGuruImageUrl.trim();
    }

    const newGuru: InstructorProfile = {
      name: newGuruName,
      title: newGuruTitle,
      imageUrl: finalImgUrl,
      bioParagraphs: newGuruBio.split('\n\n').filter(p => p.trim() !== ''),
      training: newGuruTraining.split('\n').filter(t => t.trim() !== ''),
      achievements: [],
      awards: []
    };

    setTeachers(prev => [...prev, newGuru]);
    const docId = newGuruName.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    setDoc(doc(db, "teachers", docId), newGuru).catch(err => console.error("Error adding teacher to Firestore:", err));
    triggerNotification('success', `Registered Guru ${newGuruName} as a distinguished faculty member!`);

    // Reset fields and toggle form
    setNewGuruName('');
    setNewGuruTitle('');
    setNewGuruBio('');
    setNewGuruImageUrl('');
    setNewGuruTraining('');
    setNewGuruImageFile(null);
    setNewGuruImageFilePreview(null);
    if (newGuruFileInputRef.current) newGuruFileInputRef.current.value = '';
    setShowNewGuruForm(false);
    setSelectedTeacherIdx(teachers.length); // auto-select the newly added Guru
  };

  // Edit/Update Guru profile
  const startEditingGuru = (guru: InstructorProfile) => {
    setEditGuruName(guru.name);
    setEditGuruTitle(guru.title);
    setEditGuruBio(guru.bioParagraphs ? guru.bioParagraphs.join('\n\n') : '');
    
    if (guru.imageUrl && guru.imageUrl.startsWith('data:')) {
      setEditGuruImageUrl('');
      setEditGuruImageFilePreview(guru.imageUrl);
    } else {
      setEditGuruImageUrl(guru.imageUrl || '');
      setEditGuruImageFilePreview(null);
    }
    setEditGuruImageFile(null);
    if (editGuruFileInputRef.current) editGuruFileInputRef.current.value = '';

    setEditGuruTraining(guru.training ? guru.training.join('\n') : '');
    setIsEditingGuru(true);
  };

  const handleUpdateGuru = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGuruName || !editGuruTitle || !editGuruBio) {
      triggerNotification('error', 'Guru Name, Title, and Bio are required.');
      return;
    }

    const updatedTeachers = [...teachers];
    const currentGuru = updatedTeachers[selectedTeacherIdx];
    if (!currentGuru) return;

    let finalImgUrl = "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800";
    if (editGuruImageFilePreview) {
      finalImgUrl = editGuruImageFilePreview;
    } else if (editGuruImageUrl.trim()) {
      finalImgUrl = editGuruImageUrl.trim();
    }

    currentGuru.name = editGuruName;
    currentGuru.title = editGuruTitle;
    currentGuru.imageUrl = finalImgUrl;
    currentGuru.bioParagraphs = editGuruBio.split('\n\n').filter(p => p.trim() !== '');
    currentGuru.training = editGuruTraining.split('\n').filter(t => t.trim() !== '');

    updatedTeachers[selectedTeacherIdx] = currentGuru;
    setTeachers(updatedTeachers);
    const docId = currentGuru.name.replace(/[^a-zA-Z0-9]/g, "-").toLowerCase();
    setDoc(doc(db, "teachers", docId), currentGuru).catch(err => console.error("Error updating teacher in Firestore:", err));
    triggerNotification('success', `Updated ${editGuruName}'s profile successfully!`);
    
    // Clean up
    setEditGuruImageFile(null);
    setEditGuruImageFilePreview(null);
    if (editGuruFileInputRef.current) editGuruFileInputRef.current.value = '';
    
    setIsEditingGuru(false);
  };

  // Delete Media
  const handleDeleteMedia = (id: string, title: string) => {
    setDeleteConfirm({ type: 'media', id, title });
  };

  // Status Change for Student Registrations
  const updateRegistrationStatus = (id: string, newStatus: 'Approved' | 'Contacted') => {
    setRegistrations(prev => prev.map(reg => {
      if (reg.id === id) {
        const updated = { ...reg, status: newStatus };
        setDoc(doc(db, "registrations", id), updated).catch(err => console.error("Error updating registration status:", err));
        return updated;
      }
      return reg;
    }));
    triggerNotification('success', `Registration updated to ${newStatus}.`);
  };

  // Delete Registration
  const handleDeleteRegistration = (id: string, title: string) => {
    setDeleteConfirm({ type: 'registration', id, title });
  };

  // Class Schedule submit (Handles both ADD and EDIT)
  const handleAddOrEditClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classForm.className.trim() || !classForm.description.trim()) {
      triggerNotification('error', 'Please fill in course name and description.');
      return;
    }

    if (editingClassId) {
      // Editing
      setSchedules(prev => prev.map(c => {
        if (c.id === editingClassId) {
          const updated = {
            ...c,
            ...classForm
          };
          setDoc(doc(db, "schedules", editingClassId), updated).catch(err => console.error("Error updating course in Firestore:", err));
          return updated;
        }
        return c;
      }));
      triggerNotification('success', `Course '${classForm.className}' updated successfully.`);
      setEditingClassId(null);
    } else {
      // Adding
      const item: ClassSchedule = {
        ...classForm,
        id: `class-custom-${Date.now()}`,
        registeredCount: 0
      };
      setSchedules(prev => [...prev, item]);
      setDoc(doc(db, "schedules", item.id), item).catch(err => console.error("Error saving course to Firestore:", err));
      triggerNotification('success', `New course '${classForm.className}' added successfully.`);
    }

    // Reset Form
    setClassForm({
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

  const handleEditClassClick = (course: ClassSchedule) => {
    setEditingClassId(course.id);
    setClassForm({
      className: course.className,
      level: course.level,
      ageGroup: course.ageGroup,
      instructor: course.instructor,
      dayOfWeek: course.dayOfWeek,
      timeSlot: course.timeSlot,
      duration: course.duration,
      description: course.description,
      maxStudents: course.maxStudents
    });
    // Scroll smoothly to form
    const element = document.getElementById('class-form-anchor');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const cancelClassEdit = () => {
    setEditingClassId(null);
    setClassForm({
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

  // Start Editing Registration
  const startEditingRegistration = (reg: Registration) => {
    setEditingRegId(reg.id);
    setEditingRegData({ ...reg });
  };

  // Save Registration Edits
  const saveRegistrationEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingRegData) return;

    if (!editingRegData.studentName.trim()) {
      triggerNotification('error', 'Student name is required.');
      return;
    }

    // Find requested course name if the class ID changed
    const matchedClass = schedules.find(c => c.id === editingRegData.selectedClassId);
    const updatedClassName = matchedClass ? matchedClass.className : editingRegData.selectedClassName;

    const updatedRegData = {
      ...editingRegData,
      selectedClassName: updatedClassName
    };

    setRegistrations(prev => prev.map(r => r.id === editingRegId ? updatedRegData : r));
    triggerNotification('success', 'Student registration details saved.');
    setEditingRegId(null);
    setEditingRegData(null);
  };

  // Submit manual student registration from administrative portal
  const handleManualRegSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualRegData.studentName.trim()) {
      triggerNotification('error', 'Student name is required.');
      return;
    }
    if (!manualRegData.email.trim() || !manualRegData.phone.trim()) {
      triggerNotification('error', 'Contact email and phone number are required.');
      return;
    }

    const defaultClassId = schedules[0]?.id || '';
    const chosenClassId = manualRegData.selectedClassId || defaultClassId;
    const matchedClass = schedules.find(c => c.id === chosenClassId);
    const chosenClassName = matchedClass ? matchedClass.className : 'General Kuchipudi';

    const newReg: Registration = {
      id: `reg-manual-${Date.now()}`,
      studentName: manualRegData.studentName.trim(),
      age: Number(manualRegData.age) || 18,
      parentName: manualRegData.parentName.trim() || undefined,
      email: manualRegData.email.trim(),
      phone: manualRegData.phone.trim(),
      selectedClassId: chosenClassId,
      selectedClassName: chosenClassName,
      experience: manualRegData.experience,
      notes: manualRegData.notes.trim() || undefined,
      registrationDate: new Date().toLocaleDateString(),
      status: manualRegData.status
    };

    setRegistrations(prev => [newReg, ...prev]);
    triggerNotification('success', `Manual student record '${newReg.studentName}' created successfully.`);
    
    // Reset Form
    setManualRegData({
      studentName: '',
      age: '',
      parentName: '',
      email: '',
      phone: '',
      selectedClassId: '',
      experience: 'None',
      notes: '',
      status: 'Approved'
    });
    setShowManualRegForm(false);
  };

  // Start Editing Media
  const startEditingMedia = (item: GalleryItem) => {
    setEditingMediaId(item.id);
    setEditingMediaData({ ...item });
  };

  // Save Media Edits
  const saveMediaEdits = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingMediaData) return;

    if (!editingMediaData.title.trim() || !editingMediaData.url.trim()) {
      triggerNotification('error', 'Title and URL are required.');
      return;
    }

    setGalleryItems(prev => prev.map(item => item.id === editingMediaId ? editingMediaData : item));
    triggerNotification('success', 'Gallery item updated.');
    setEditingMediaId(null);
    setEditingMediaData(null);
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
              { id: 'awards', label: 'Gurus & Awards', count: teachers.length, icon: Award }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeSubTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveSubTab(tab.id as any);
                    setEditingRegId(null);
                    setEditingMediaId(null);
                  }}
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
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#9c7a46]">
                      Admissions & Enrollment Inquiries
                    </h3>
                    <p className="text-stone-400 font-light text-xs sm:text-sm mt-1">
                      Manage incoming student signups, contact parents, or change any of the fields for each candidate profile.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setShowManualRegForm(!showManualRegForm);
                      // Pre-fill default class if empty
                      setManualRegData(prev => ({
                        ...prev,
                        selectedClassId: prev.selectedClassId || (schedules[0]?.id || '')
                      }));
                    }}
                    className="shrink-0 flex items-center space-x-2 px-4 py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    {showManualRegForm ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                    <span>{showManualRegForm ? 'Cancel Manual Enrollment' : 'Add Student Manually'}</span>
                  </button>
                </div>

                {/* MANUAL REGISTRATION FORM */}
                {showManualRegForm && (
                  <form onSubmit={handleManualRegSubmit} className="space-y-4 bg-amber-50/30 border border-[#c5a059]/35 p-5 sm:p-6 rounded-2xl">
                    <div className="border-b border-stone-200 pb-2.5 mb-3 flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-[#9c7a46]">
                        <UserCheck className="h-4.5 w-4.5" />
                        <h4 className="font-serif font-bold text-sm">Add New Student Registration (Office Manual Enrollment)</h4>
                      </div>
                      <span className="text-[10px] text-stone-400 italic">Immediate Confirmation</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Student Full Name *</label>
                        <input
                          type="text"
                          placeholder="e.g. Priyal Patel"
                          value={manualRegData.studentName}
                          onChange={(e) => setManualRegData({ ...manualRegData, studentName: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Student Age *</label>
                        <input
                          type="number"
                          placeholder="e.g. 12"
                          value={manualRegData.age}
                          onChange={(e) => setManualRegData({ ...manualRegData, age: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Parent / Guardian Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Rajesh Patel"
                          value={manualRegData.parentName}
                          onChange={(e) => setManualRegData({ ...manualRegData, parentName: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Email Address *</label>
                        <input
                          type="email"
                          placeholder="parent@example.com"
                          value={manualRegData.email}
                          onChange={(e) => setManualRegData({ ...manualRegData, email: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Phone Number *</label>
                        <input
                          type="text"
                          placeholder="e.g. 9876543210"
                          value={manualRegData.phone}
                          onChange={(e) => setManualRegData({ ...manualRegData, phone: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Target Kuchipudi Course *</label>
                        <select
                          value={manualRegData.selectedClassId}
                          onChange={(e) => setManualRegData({ ...manualRegData, selectedClassId: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                        >
                          {schedules.map(c => (
                            <option key={c.id} value={c.id}>{c.className} ({c.level})</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Prior Dance Experience</label>
                        <select
                          value={manualRegData.experience}
                          onChange={(e) => setManualRegData({ ...manualRegData, experience: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                        >
                          <option value="None">Absolute Beginner</option>
                          <option value="1-2 years">1-2 Years Training</option>
                          <option value="3-5 years">3-5 Years Training</option>
                          <option value="5+ years">5+ Years Training</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Initial Admission Status</label>
                        <select
                          value={manualRegData.status}
                          onChange={(e: any) => setManualRegData({ ...manualRegData, status: e.target.value })}
                          className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs font-bold focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                        >
                          <option value="Approved">Approved (Enrolled)</option>
                          <option value="Contacted">Contacted (In Review)</option>
                          <option value="Pending">Pending Inbound</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase tracking-wide">Enrollment Remarks / Office Notes</label>
                      <textarea
                        placeholder="e.g. Registered manually via telephone inquiries."
                        value={manualRegData.notes}
                        onChange={(e) => setManualRegData({ ...manualRegData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 bg-white text-stone-900 border border-stone-300 rounded-lg text-xs focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setShowManualRegForm(false)}
                        className="px-4 py-2 border border-stone-200 hover:bg-stone-50 text-stone-600 rounded-lg text-xs font-bold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#c5a059] hover:bg-[#b08b49] text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Confirm and Register Student</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* EDITING FOR OVERLAY FORM */}
                {editingRegId && editingRegData && (
                  <form onSubmit={saveRegistrationEdits} className="space-y-4 bg-white border-2 border-[#c5a059] p-5 sm:p-6 rounded-2xl shadow-lg relative z-10">
                    <div className="border-b border-stone-200 pb-2.5 mb-2 flex justify-between items-center">
                      <div className="flex items-center space-x-2 text-[#9c7a46]">
                        <Edit3 className="h-4.5 w-4.5" />
                        <h4 className="font-serif font-bold text-sm">Modify Inbound Candidate Parameters</h4>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setEditingRegId(null); setEditingRegData(null); }}
                        className="p-1 rounded-md text-stone-400 hover:text-stone-600 hover:bg-stone-100 transition-colors"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Student Name *</label>
                        <input
                          type="text"
                          value={editingRegData.studentName}
                          onChange={(e) => setEditingRegData({ ...editingRegData, studentName: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                          required
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Student Age</label>
                        <input
                          type="number"
                          value={editingRegData.age}
                          onChange={(e) => setEditingRegData({ ...editingRegData, age: Number(e.target.value) })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Parent / Guardian Name</label>
                        <input
                          type="text"
                          value={editingRegData.parentName || ''}
                          onChange={(e) => setEditingRegData({ ...editingRegData, parentName: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                          placeholder="Leave blank if adult"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Email Address</label>
                        <input
                          type="email"
                          value={editingRegData.email}
                          onChange={(e) => setEditingRegData({ ...editingRegData, email: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Phone Number</label>
                        <input
                          type="text"
                          value={editingRegData.phone}
                          onChange={(e) => setEditingRegData({ ...editingRegData, phone: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Desired Course</label>
                        <select
                          value={editingRegData.selectedClassId}
                          onChange={(e) => setEditingRegData({ ...editingRegData, selectedClassId: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                        >
                          {schedules.map(c => (
                            <option key={c.id} value={c.id}>{c.className}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Prior Experience</label>
                        <select
                          value={editingRegData.experience}
                          onChange={(e) => setEditingRegData({ ...editingRegData, experience: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                        >
                          <option value="None">Absolute Beginner</option>
                          <option value="1-2 years">1-2 years training</option>
                          <option value="3-5 years">3-5 years training</option>
                          <option value="5+ years">5+ years training</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Status</label>
                        <select
                          value={editingRegData.status}
                          onChange={(e: any) => setEditingRegData({ ...editingRegData, status: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900 font-bold"
                        >
                          <option value="Pending">Pending</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Approved">Approved</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Submission Date</label>
                        <input
                          type="text"
                          value={editingRegData.registrationDate}
                          onChange={(e) => setEditingRegData({ ...editingRegData, registrationDate: e.target.value })}
                          className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-500 uppercase tracking-wide">Additional Notes & Requests</label>
                      <textarea
                        value={editingRegData.notes || ''}
                        onChange={(e) => setEditingRegData({ ...editingRegData, notes: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border rounded-lg text-xs bg-white text-stone-900"
                      />
                    </div>

                    <div className="flex space-x-2 pt-2 justify-end">
                      <button
                        type="button"
                        onClick={() => { setEditingRegId(null); setEditingRegData(null); }}
                        className="px-4 py-2 border rounded-lg text-xs font-semibold hover:bg-stone-50"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#c5a059] hover:bg-[#b08b49] text-white rounded-lg text-xs font-bold flex items-center space-x-1"
                      >
                        <Save className="h-4 w-4" />
                        <span>Save Record</span>
                      </button>
                    </div>
                  </form>
                )}

                {registrations.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-stone-200 rounded-xl bg-stone-50">
                    <UserCheck className="h-10 w-10 text-stone-400 mx-auto mb-3" />
                    <p className="text-stone-500 text-sm font-light">No registrations logged yet.</p>
                  </div>
                ) : (
                  /* BEAUTIFUL TABLE VIEW */
                  <div className="overflow-x-auto border border-stone-200 rounded-2xl bg-white shadow-xs">
                    <table className="min-w-full divide-y divide-stone-200 text-left text-xs sm:text-sm">
                      <thead className="bg-[#faf9f6]">
                        <tr>
                          <th scope="col" className="px-5 py-4 font-serif font-bold text-[#9c7a46] uppercase tracking-wider text-[11px] border-b border-stone-200">
                            Student / Guardian
                          </th>
                          <th scope="col" className="px-5 py-4 font-serif font-bold text-[#9c7a46] uppercase tracking-wider text-[11px] border-b border-stone-200">
                            Requested Course
                          </th>
                          <th scope="col" className="px-5 py-4 font-serif font-bold text-[#9c7a46] uppercase tracking-wider text-[11px] border-b border-stone-200">
                            Contact Details
                          </th>
                          <th scope="col" className="px-5 py-4 font-serif font-bold text-[#9c7a46] uppercase tracking-wider text-[11px] border-b border-stone-200">
                            Submission / Experience
                          </th>
                          <th scope="col" className="px-5 py-4 font-serif font-bold text-[#9c7a46] uppercase tracking-wider text-[11px] border-b border-stone-200">
                            Status
                          </th>
                          <th scope="col" className="px-5 py-4 font-serif font-bold text-[#9c7a46] uppercase tracking-wider text-[11px] border-b border-stone-200 text-right">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100 bg-white">
                        {registrations.map((reg) => (
                          <tr key={reg.id} className="hover:bg-stone-50/75 transition-colors">
                            {/* Student / Guardian */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="space-y-0.5">
                                <div className="font-bold text-stone-900 flex items-center space-x-1.5">
                                  <span>{reg.studentName}</span>
                                  <span className="text-[11px] text-stone-500 font-normal">({reg.age} yrs)</span>
                                </div>
                                {reg.parentName ? (
                                  <div className="text-[11px] text-stone-400 font-medium">
                                    Parent: {reg.parentName}
                                  </div>
                                ) : (
                                  <div className="text-[10px] text-stone-400 italic">Self-enrolled</div>
                                )}
                              </div>
                            </td>

                            {/* Requested Course */}
                            <td className="px-5 py-4">
                              <div className="text-stone-800 font-semibold text-xs text-[#9c7a46]">
                                {reg.selectedClassName}
                              </div>
                            </td>

                            {/* Contact Details */}
                            <td className="px-5 py-4">
                              <div className="space-y-0.5 text-xs text-stone-600 font-medium">
                                <div>{reg.phone}</div>
                                <div className="text-stone-400 font-mono text-[11px]">{reg.email}</div>
                              </div>
                            </td>

                            {/* Submission / Experience */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="space-y-0.5 text-xs">
                                <div className="text-stone-500 font-mono text-[11px]">Submitted: {reg.registrationDate}</div>
                                <div className="text-stone-700">
                                  Exp: <span className="font-semibold text-stone-900">{reg.experience}</span>
                                </div>
                              </div>
                            </td>

                            {/* Status Badge */}
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider rounded-full border ${
                                reg.status === 'Pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                reg.status === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                'bg-indigo-50 text-indigo-700 border-indigo-200'
                              }`}>
                                {reg.status}
                              </span>
                            </td>

                            {/* Actions Column */}
                            <td className="px-5 py-4 whitespace-nowrap text-right text-xs font-medium">
                              <div className="flex items-center justify-end space-x-1.5">
                                {reg.status !== 'Contacted' && (
                                  <button
                                    onClick={() => updateRegistrationStatus(reg.id, 'Contacted')}
                                    className="px-2 py-1 border border-stone-200 bg-white hover:bg-stone-50 text-[10px] font-bold text-[#9c7a46] uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-2xs"
                                    title="Mark parent as contacted"
                                  >
                                    Contact
                                  </button>
                                )}
                                {reg.status !== 'Approved' && (
                                  <button
                                    onClick={() => updateRegistrationStatus(reg.id, 'Approved')}
                                    className="px-2 py-1 bg-[#c5a059] text-white hover:bg-[#b08b49] text-[10px] font-bold uppercase tracking-wider rounded-md transition-all cursor-pointer shadow-2xs"
                                    title="Approve and enroll candidate"
                                  >
                                    Approve
                                  </button>
                                )}
                                <button
                                  onClick={() => startEditingRegistration(reg)}
                                  className="p-1 text-stone-500 hover:text-[#9c7a46] hover:bg-stone-100 rounded-md transition-colors cursor-pointer border border-transparent"
                                  title="Edit full registration"
                                >
                                  <Edit3 className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteRegistration(reg.id, reg.studentName)}
                                  className="p-1 text-stone-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors cursor-pointer border border-transparent"
                                  title="Delete registration record"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* 2. MEDIA GALLERY PANEL */}
            {activeSubTab === 'media' && (
              <div className="space-y-6">
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#9c7a46]">
                    Gallery Daily Uploads
                  </h3>
                  <p className="text-stone-400 font-light text-xs sm:text-sm mt-1">
                    Publish new high-definition class materials or edit fields of existing entries in the media stream.
                  </p>
                </div>

                {/* Media add form */}
                <form onSubmit={handleAddMedia} className="space-y-4 bg-stone-50 border border-stone-200 p-5 rounded-xl">
                  <span className="text-xs font-bold text-stone-500 uppercase tracking-wider block">Add New Media Item</span>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-stone-600 uppercase">Category</label>
                      <select 
                        value={mediaCategory}
                        onChange={(e: any) => setMediaCategory(e.target.value)}
                        className="w-full max-w-xs px-3 py-2 bg-white text-stone-800 border rounded text-xs"
                      >
                        <option value="Performance">Performance</option>
                        <option value="Classroom">Classroom</option>
                        <option value="Festival">Festival</option>
                        <option value="Workshop">Workshop</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-3 pt-2">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Image Link URL</label>
                        <input 
                          type="text"
                          value={mediaUrlInput}
                          onChange={(e) => {
                            setMediaUrlInput(e.target.value);
                            setMediaFilePreview(null);
                          }}
                          placeholder="https://images.unsplash.com/..."
                          className="w-full px-3 py-2 bg-white text-stone-800 border rounded text-xs"
                        />
                      </div>
                      <div className="shrink-0 text-center text-xs font-semibold text-stone-400 py-1 sm:pt-4">OR</div>
                      <div className="flex-1">
                        <label className="block text-[10px] font-bold text-stone-600 uppercase mb-1">Upload File (Auto-Compressed)</label>
                        <input 
                          type="file"
                          ref={fileInputRef}
                          onChange={handleFileChange}
                          accept="image/*"
                          className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300"
                        />
                      </div>
                    </div>

                    {mediaFilePreview && (
                      <div className="w-24 h-24 relative rounded-md overflow-hidden border">
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
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isCompressing}
                    className="px-4 py-2 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-bold rounded shadow"
                  >
                    Add Media Item
                  </button>
                </form>

                {/* Inventory / Editing list */}
                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[#9c7a46] border-b border-stone-200 pb-2">
                    Gallery Inventory Manager
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {galleryItems.map((item) => (
                      <div key={item.id} className="border border-stone-200 rounded-xl bg-stone-50 p-4 space-y-3">
                        {editingMediaId === item.id && editingMediaData ? (
                          /* INLINE MEDIA EDIT FORM */
                          <form onSubmit={saveMediaEdits} className="space-y-2 bg-white p-3 border rounded-lg">
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-stone-400">Media Title *</label>
                              <input 
                                type="text"
                                value={editingMediaData.title}
                                onChange={(e) => setEditingMediaData({ ...editingMediaData, title: e.target.value })}
                                className="w-full p-1 border rounded text-xs bg-white text-stone-900"
                                required
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-stone-400">Category</label>
                              <select 
                                value={editingMediaData.category}
                                onChange={(e: any) => setEditingMediaData({ ...editingMediaData, category: e.target.value })}
                                className="w-full p-1 border rounded text-xs bg-white text-stone-900"
                              >
                                <option value="Performance">Performance</option>
                                <option value="Classroom">Classroom</option>
                                <option value="Festival">Festival</option>
                                <option value="Workshop">Workshop</option>
                              </select>
                            </div>
                            <div className="space-y-1">
                              <label className="text-[9px] font-bold uppercase text-stone-400">URL / Source Link</label>
                              <input 
                                type="text"
                                value={editingMediaData.url}
                                onChange={(e) => setEditingMediaData({ ...editingMediaData, url: e.target.value })}
                                className="w-full p-1 border rounded text-xs bg-white text-stone-900"
                                required
                              />
                            </div>
                            <div className="flex justify-end space-x-1.5 pt-1">
                              <button 
                                type="button" 
                                onClick={() => { setEditingMediaId(null); setEditingMediaData(null); }}
                                className="px-2 py-1 text-[10px] border rounded hover:bg-stone-50"
                              >
                                Cancel
                              </button>
                              <button 
                                type="submit" 
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold"
                              >
                                Save
                              </button>
                            </div>
                          </form>
                        ) : (
                          /* MEDIA VIEW CARD */
                          <div className="flex items-center space-x-3 text-stone-800">
                            <div className="w-14 h-14 bg-stone-150 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                              {item.type === 'video' ? (
                                <div className="w-full h-full bg-stone-900 flex items-center justify-center text-red-500">
                                  <Video className="h-5 w-5" />
                                </div>
                              ) : (
                                <img src={item.url} alt="" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                              )}
                            </div>
                            <div className="flex-grow min-w-0">
                              <h5 className="text-xs font-bold text-stone-900 truncate font-serif">{item.title}</h5>
                              <span className="block text-[10px] text-[#9c7a46] font-semibold uppercase font-mono">{item.category}</span>
                              <span className="block text-[10px] text-stone-400 truncate max-w-xs">{item.url}</span>
                            </div>
                            <div className="flex flex-col space-y-1 shrink-0">
                              <button
                                onClick={() => startEditingMedia(item)}
                                className="p-1.5 text-[#9c7a46] hover:bg-white rounded border border-transparent hover:border-stone-200"
                                title="Edit properties"
                              >
                                <Edit3 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteMedia(item.id, item.title)}
                                className="p-1.5 text-stone-400 hover:text-rose-600 rounded hover:bg-white transition-colors cursor-pointer border border-transparent hover:border-rose-200"
                                title="Remove from gallery"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 3. SCHEDULES PANEL */}
            {activeSubTab === 'classes' && (
              <div className="space-y-8">
                <div id="class-form-anchor">
                  <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#9c7a46]">
                    {editingClassId ? 'Edit Course Schedule' : 'Add New Course Schedule'}
                  </h3>
                  <p className="text-stone-500 font-light text-xs sm:text-sm mt-1">
                    {editingClassId 
                      ? 'Make changes to any fields of this existing syllabus, timing, capacity or instructor profile.'
                      : 'Introduce a new dance class syllabus, timings, maximum capacity, or instructor profiles.'}
                  </p>
                </div>

                <form onSubmit={handleAddOrEditClass} className="space-y-5 bg-stone-50 border border-stone-200 p-6 rounded-xl">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Class Name */}
                    <div className="space-y-1.5">
                      <label htmlFor="className" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Course Name *
                      </label>
                      <input
                        type="text"
                        id="className"
                        value={classForm.className}
                        onChange={(e) => setClassForm(prev => ({ ...prev, className: e.target.value }))}
                        placeholder="e.g. Tarangam Intensive Class"
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Level */}
                    <div className="space-y-1.5">
                      <label htmlFor="classLevel" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Difficulty Level
                      </label>
                      <select
                        id="classLevel"
                        value={classForm.level}
                        onChange={(e: any) => setClassForm(prev => ({ ...prev, level: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-xs focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-semibold"
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
                      <label htmlFor="ageGroup" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Target Age Group
                      </label>
                      <input
                        type="text"
                        id="ageGroup"
                        value={classForm.ageGroup}
                        onChange={(e) => setClassForm(prev => ({ ...prev, ageGroup: e.target.value }))}
                        placeholder="Kids (Ages 6-11)"
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Instructor */}
                    <div className="space-y-1.5">
                      <label htmlFor="instructor" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Instructor Name
                      </label>
                      <input
                        type="text"
                        id="instructor"
                        value={classForm.instructor}
                        onChange={(e) => setClassForm(prev => ({ ...prev, instructor: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-medium"
                      />
                    </div>

                    {/* Max Students */}
                    <div className="space-y-1.5">
                      <label htmlFor="maxStudents" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Max Capacity
                      </label>
                      <input
                        type="number"
                        id="maxStudents"
                        min="1"
                        max="50"
                        value={classForm.maxStudents}
                        onChange={(e) => setClassForm(prev => ({ ...prev, maxStudents: Number(e.target.value) }))}
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {/* Day of Week */}
                    <div className="space-y-1.5">
                      <label htmlFor="dayOfWeek" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Day of Week
                      </label>
                      <select
                        id="dayOfWeek"
                        value={classForm.dayOfWeek}
                        onChange={(e: any) => setClassForm(prev => ({ ...prev, dayOfWeek: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-xs focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-semibold"
                      >
                        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                          <option key={d} value={d}>{d}</option>
                        ))}
                      </select>
                    </div>

                    {/* Time slot */}
                    <div className="space-y-1.5">
                      <label htmlFor="timeSlot" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Time Slot *
                      </label>
                      <input
                        type="text"
                        id="timeSlot"
                        value={classForm.timeSlot}
                        onChange={(e) => setClassForm(prev => ({ ...prev, timeSlot: e.target.value }))}
                        placeholder="05:00 PM - 06:30 PM"
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>

                    {/* Duration */}
                    <div className="space-y-1.5">
                      <label htmlFor="duration" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                        Session Duration
                      </label>
                      <input
                        type="text"
                        id="duration"
                        value={classForm.duration}
                        onChange={(e) => setClassForm(prev => ({ ...prev, duration: e.target.value }))}
                        placeholder="90 Minutes"
                        className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5">
                    <label htmlFor="classDesc" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Syllabus & Course Description *
                    </label>
                    <textarea
                      id="classDesc"
                      rows={3}
                      value={classForm.description}
                      onChange={(e) => setClassForm(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Outline the steps, posture focus, and items taught in this class."
                      className="w-full px-4 py-2.5 bg-white text-stone-800 border border-stone-300 rounded-lg text-sm focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                    />
                  </div>

                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-bold uppercase tracking-wider rounded-lg shadow-sm cursor-pointer"
                    >
                      {editingClassId ? 'Save Course Changes' : 'Save Course Schedule'}
                    </button>
                    {editingClassId && (
                      <button
                        type="button"
                        onClick={cancelClassEdit}
                        className="px-5 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                      >
                        Cancel
                      </button>
                    )}
                  </div>
                </form>

                {/* List classes manager */}
                <div className="space-y-4">
                  <h4 className="font-serif text-lg font-bold text-[#9c7a46] border-b border-stone-200 pb-2">
                    Active Schedules
                  </h4>

                  <div className="space-y-3">
                    {schedules.map((c) => (
                      <div key={c.id} className="flex items-center justify-between p-4 border border-stone-200 rounded-xl bg-stone-50 hover:bg-stone-100 transition-all text-xs text-stone-600">
                        <div>
                          <h5 className="font-serif font-bold text-stone-900 text-sm">{c.className}</h5>
                          <span className="text-stone-550">{c.dayOfWeek}s at {c.timeSlot} • Instructor: {c.instructor} ({c.level})</span>
                        </div>
                        <div className="flex items-center space-x-1 shrink-0">
                          <button
                            onClick={() => handleEditClassClick(c)}
                            className="p-1.5 text-[#9c7a46] hover:bg-white rounded hover:border-stone-200 transition-all"
                            title="Edit schedule details"
                          >
                            <Edit3 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClass(c.id, c.className)}
                            className="p-1.5 text-stone-400 hover:text-rose-600 rounded-md hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
                            title="Delete schedule"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

            {/* 4. GURUS & AWARDS PANEL */}
            {activeSubTab === 'awards' && (
              <div className="space-y-8 animate-fade-in">
                
                {/* Header info */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-4 pb-4 border-b border-stone-100">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#9c7a46] flex items-center space-x-2">
                      <Award className="h-6 w-6 text-[#9c7a46]" />
                      <span>Gurus & Faculty Awards Administration</span>
                    </h3>
                    <p className="text-stone-500 text-xs mt-1">
                      Manage official titles, recognitions, and national honors of Gurus and register new faculty members.
                    </p>
                  </div>
                  <button
                    onClick={() => setShowNewGuruForm(!showNewGuruForm)}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-[#9c7a46] hover:bg-[#866639] text-white text-xs font-semibold rounded-lg tracking-wider uppercase transition-colors shadow-sm cursor-pointer"
                  >
                    {showNewGuruForm ? (
                      <>
                        <X className="h-4 w-4" />
                        <span>Cancel</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>✦ Register New Guru Profile</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Form to Register a New Guru Profile */}
                {showNewGuruForm && (
                  <form onSubmit={handleAddGuru} className="p-6 bg-amber-50/20 border border-[#c5a059]/40 rounded-2xl space-y-4 shadow-xs animate-fade-in">
                    <h4 className="font-serif font-bold text-[#9c7a46] text-sm flex items-center space-x-2">
                      <Sparkles className="h-4 w-4 text-[#9c7a46]" />
                      <span>Register Distinguished Faculty Profile</span>
                    </h4>
                    <p className="text-stone-500 text-[11px] leading-relaxed">
                      Create an official biography and professional credentials card. Once saved, this guru will show up in the "Guru & Heritage" tab.
                    </p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Full Name *</label>
                        <input
                          type="text"
                          required
                          value={newGuruName}
                          onChange={(e) => setNewGuruName(e.target.value)}
                          placeholder="e.g. Guru Dr. Srimayi Devi Prasanna"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Official Professional Title *</label>
                        <input
                          type="text"
                          required
                          value={newGuruTitle}
                          onChange={(e) => setNewGuruTitle(e.target.value)}
                          placeholder="e.g. Founder & Artistic Director | National Nritya Shiromani Awardee"
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 bg-stone-100/50 p-4 rounded-xl border border-stone-200">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">Faculty Portrait Image</span>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1">Image Link URL</label>
                          <input
                            type="url"
                            value={newGuruImageUrl}
                            onChange={(e) => {
                              setNewGuruImageUrl(e.target.value);
                              setNewGuruImageFilePreview(null);
                              setNewGuruImageFile(null);
                              if (newGuruFileInputRef.current) newGuruFileInputRef.current.value = '';
                            }}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                          />
                        </div>
                        <div className="shrink-0 text-center text-xs font-semibold text-stone-400 py-1 md:pt-4">OR</div>
                        <div className="flex-1">
                          <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1">Upload Photo {isGuruImageCompressing ? '(Processing...)' : '(Auto-Compressed)'}</label>
                          <input
                            type="file"
                            ref={newGuruFileInputRef}
                            onChange={handleNewGuruFileChange}
                            accept="image/*"
                            className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
                          />
                        </div>
                      </div>

                      {newGuruImageFilePreview && (
                        <div className="flex items-center space-x-3 pt-1">
                          <div className="w-16 h-16 relative rounded-md overflow-hidden border border-stone-200">
                            <img src={newGuruImageFilePreview} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setNewGuruImageFile(null);
                              setNewGuruImageFilePreview(null);
                              if (newGuruFileInputRef.current) newGuruFileInputRef.current.value = '';
                            }}
                            className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            <span>Remove Photo</span>
                          </button>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Professional Heritage & Training (One per line) *</label>
                        <textarea
                          required
                          rows={2}
                          value={newGuruTraining}
                          onChange={(e) => setNewGuruTraining(e.target.value)}
                          placeholder="e.g. Advanced Gurukul Training (12 years) under veteran Guru..."
                          className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-stone-700 uppercase mb-1">Detailed Biography (Use double-newlines for paragraphs) *</label>
                      <textarea
                        required
                        rows={3}
                        value={newGuruBio}
                        onChange={(e) => setNewGuruBio(e.target.value)}
                        placeholder="e.g. Srimayi Devi Prasanna is one of the foremost exponents of the traditional Kuchipudi style..."
                        className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                      />
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        type="submit"
                        className="px-5 py-2 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-semibold rounded-lg tracking-wider uppercase transition-colors shadow-xs cursor-pointer flex items-center space-x-1"
                      >
                        <Check className="h-4 w-4" />
                        <span>Save Guru Profile</span>
                      </button>
                    </div>
                  </form>
                )}

                {/* Main Awards Manager Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Select active teacher and add awards form (5 columns) */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-stone-50 border border-stone-200 p-5 rounded-2xl space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold text-[#9c7a46] uppercase mb-1.5 tracking-wider">Select Guru Profile</label>
                        <select
                          value={selectedTeacherIdx}
                          onChange={(e) => {
                            setSelectedTeacherIdx(Number(e.target.value));
                          }}
                          className="w-full px-3 py-2.5 text-xs font-medium border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                        >
                          {teachers.map((teacher, idx) => (
                            <option key={idx} value={idx}>{teacher.name}</option>
                          ))}
                        </select>
                      </div>

                      {teachers[selectedTeacherIdx] && (
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3 p-3 bg-white border border-stone-150 rounded-xl">
                            <img
                              src={teachers[selectedTeacherIdx].imageUrl}
                              alt={teachers[selectedTeacherIdx].name}
                              className="w-12 h-12 rounded-lg object-cover border border-stone-200"
                            />
                            <div className="min-w-0 flex-1">
                              <h5 className="font-serif font-bold text-stone-900 text-xs truncate">{teachers[selectedTeacherIdx].name}</h5>
                              <p className="text-[10px] text-stone-500 italic truncate">{teachers[selectedTeacherIdx].title.split('|')[0]}</p>
                              <span className="text-[9px] font-bold text-[#9c7a46] bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100 mt-1 inline-block">
                                {teachers[selectedTeacherIdx].awards?.length || 0} Honors / Awards
                              </span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (isEditingGuru) {
                                setIsEditingGuru(false);
                              } else {
                                startEditingGuru(teachers[selectedTeacherIdx]);
                              }
                            }}
                            className="w-full py-2 border border-stone-300 hover:border-[#9c7a46] hover:text-[#9c7a46] text-stone-600 text-[10px] font-bold rounded-lg uppercase tracking-wider transition-colors flex items-center justify-center space-x-1.5 cursor-pointer bg-white"
                          >
                            <Edit3 className="h-3.5 w-3.5" />
                            <span>{isEditingGuru ? "Cancel Profile Editing" : "✏️ Edit Guru Profile (Rewrite Name/Details)"}</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Add Award form or Edit Guru form */}
                    {teachers[selectedTeacherIdx] && (
                      isEditingGuru ? (
                        <form onSubmit={handleUpdateGuru} className="bg-amber-50/10 border border-[#c5a059]/30 p-5 rounded-2xl space-y-4 shadow-sm animate-fade-in">
                          <div className="flex items-center justify-between pb-2 border-b border-[#c5a059]/20 text-[#9c7a46]">
                            <div className="flex items-center space-x-2">
                              <Edit3 className="h-4 w-4" />
                              <h4 className="font-serif font-bold text-xs sm:text-sm">Edit Guru Profile</h4>
                            </div>
                            <button
                              type="button"
                              onClick={() => setIsEditingGuru(false)}
                              className="text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1 tracking-wide">Full Name *</label>
                            <input
                              type="text"
                              required
                              value={editGuruName}
                              onChange={(e) => setEditGuruName(e.target.value)}
                              placeholder="e.g. Guru Dr. Srimayi Devi"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1 tracking-wide">Official Professional Title *</label>
                            <input
                              type="text"
                              required
                              value={editGuruTitle}
                              onChange={(e) => setEditGuruTitle(e.target.value)}
                              placeholder="e.g. Founder & Artistic Director"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                            />
                          </div>

                          <div className="space-y-3 bg-stone-100/50 p-4 rounded-xl border border-stone-200">
                            <span className="text-[10px] font-bold text-stone-700 uppercase tracking-wider block">Faculty Portrait Image</span>
                            <div className="flex flex-col md:flex-row md:items-center gap-4">
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1">Image Link URL</label>
                                <input
                                  type="url"
                                  value={editGuruImageUrl}
                                  onChange={(e) => {
                                    setEditGuruImageUrl(e.target.value);
                                    setEditGuruImageFilePreview(null);
                                    setEditGuruImageFile(null);
                                    if (editGuruFileInputRef.current) editGuruFileInputRef.current.value = '';
                                  }}
                                  placeholder="https://images.unsplash.com/photo-..."
                                  className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                                />
                              </div>
                              <div className="shrink-0 text-center text-xs font-semibold text-stone-400 py-1 md:pt-4">OR</div>
                              <div className="flex-1">
                                <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1">Upload Photo {isGuruImageCompressing ? '(Processing...)' : '(Auto-Compressed)'}</label>
                                <input
                                  type="file"
                                  ref={editGuruFileInputRef}
                                  onChange={handleEditGuruFileChange}
                                  accept="image/*"
                                  className="w-full text-xs text-stone-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-stone-200 file:text-stone-700 hover:file:bg-stone-300 cursor-pointer"
                                />
                              </div>
                            </div>

                            {editGuruImageFilePreview && (
                              <div className="flex items-center space-x-3 pt-1">
                                <div className="w-16 h-16 relative rounded-md overflow-hidden border border-stone-200">
                                  <img src={editGuruImageFilePreview} alt="Preview" className="w-full h-full object-cover" />
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditGuruImageFile(null);
                                    setEditGuruImageFilePreview(null);
                                    if (editGuruFileInputRef.current) editGuruFileInputRef.current.value = '';
                                  }}
                                  className="text-xs text-red-600 hover:text-red-800 font-semibold flex items-center space-x-1"
                                >
                                  <Trash2 className="h-3 w-3" />
                                  <span>Remove Photo</span>
                                </button>
                              </div>
                            )}
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1 tracking-wide">Heritage & Training (One per line)</label>
                            <textarea
                              rows={2}
                              value={editGuruTraining}
                              onChange={(e) => setEditGuruTraining(e.target.value)}
                              placeholder="e.g. Advanced Gurukul Training (12 years) under..."
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1 tracking-wide">Detailed Biography (double-newline for paragraphs) *</label>
                            <textarea
                              required
                              rows={3}
                              value={editGuruBio}
                              onChange={(e) => setEditGuruBio(e.target.value)}
                              placeholder="Biography details..."
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-white text-stone-800"
                            />
                          </div>

                          <div className="flex space-x-2">
                            <button
                              type="button"
                              onClick={() => setIsEditingGuru(false)}
                              className="flex-1 py-2 border border-stone-300 text-stone-600 hover:bg-stone-50 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="flex-1 py-2 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-semibold rounded-lg tracking-wider uppercase transition-colors shadow-xs cursor-pointer flex items-center justify-center space-x-1"
                            >
                              <Save className="h-3.5 w-3.5" />
                              <span>Save Profile</span>
                            </button>
                          </div>
                        </form>
                      ) : (
                        <form onSubmit={handleAddAward} className="bg-white border border-stone-200 p-5 rounded-2xl space-y-4 shadow-sm">
                          <div className="flex items-center space-x-2 pb-2 border-b border-stone-100 text-[#9c7a46]">
                            <Award className="h-4.5 w-4.5" />
                            <h4 className="font-serif font-bold text-xs sm:text-sm">Confer New Honor / Award</h4>
                          </div>
                          
                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1 tracking-wide">Year of Recognition *</label>
                            <input
                              type="text"
                              required
                              value={newAwardYear}
                              onChange={(e) => setNewAwardYear(e.target.value)}
                              placeholder="e.g. 2026 or 2026 - Present"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-stone-50/50 text-stone-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1 tracking-wide">Award / Title Title *</label>
                            <input
                              type="text"
                              required
                              value={newAwardTitle}
                              onChange={(e) => setNewAwardTitle(e.target.value)}
                              placeholder="e.g. Kala Ratna National Award or Sangeet Natak Akademi Puraskar"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-stone-50/50 text-stone-800"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-stone-700 uppercase mb-1 tracking-wide">Conferred By Organization *</label>
                            <input
                              type="text"
                              required
                              value={newAwardOrganization}
                              onChange={(e) => setNewAwardOrganization(e.target.value)}
                              placeholder="e.g. National Classical Dance Federation or Ministry of Culture"
                              className="w-full px-3 py-2 text-xs border border-stone-300 rounded-lg focus:outline-none focus:border-[#c5a059] bg-stone-50/50 text-stone-800"
                            />
                          </div>

                          <button
                            type="submit"
                            className="w-full py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-bold rounded-lg tracking-widest uppercase transition-colors shadow-xs cursor-pointer flex items-center justify-center space-x-2"
                          >
                            <Plus className="h-4 w-4" />
                            <span>Add Honor & Award</span>
                          </button>
                        </form>
                      )
                    )}
                  </div>

                  {/* List of currently recorded awards (7 columns) */}
                  <div className="lg:col-span-7 space-y-4">
                    {teachers[selectedTeacherIdx] && (
                      <div className="bg-white border border-stone-200 p-5 rounded-2xl shadow-sm">
                        <div className="flex items-center justify-between pb-3 border-b border-stone-100 mb-4">
                          <h4 className="font-serif font-bold text-[#9c7a46] text-xs sm:text-sm">
                            Honors & Recognitions Timeline
                          </h4>
                          <span className="text-[10px] text-stone-400">Total: {teachers[selectedTeacherIdx].awards?.length || 0}</span>
                        </div>

                        {!teachers[selectedTeacherIdx].awards || teachers[selectedTeacherIdx].awards.length === 0 ? (
                          <div className="text-center py-10 px-4">
                            <Award className="h-10 w-10 text-stone-300 mx-auto mb-3" />
                            <p className="text-stone-500 font-light text-xs">This Guru does not have any recorded honors yet.</p>
                            <p className="text-[10px] text-stone-400 mt-1">Use the form on the left to add prestigious milestones to their heritage biography.</p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                            {teachers[selectedTeacherIdx].awards.map((award, aIdx) => (
                              <div
                                key={aIdx}
                                className="flex items-start justify-between p-3 border border-stone-150 rounded-xl bg-stone-50/50 hover:bg-stone-50 hover:border-amber-200 transition-all text-stone-800"
                              >
                                <div className="flex items-start space-x-3">
                                  <span className="text-[10px] font-bold text-white bg-[#c5a059] px-2 py-0.5 rounded-md shrink-0 font-mono mt-0.5">
                                    {award.year}
                                  </span>
                                  <div className="min-w-0">
                                    <h5 className="font-serif font-bold text-stone-900 text-xs sm:text-sm">
                                      {award.title}
                                    </h5>
                                    <p className="text-[10px] text-stone-500 font-light mt-0.5">
                                      Conferred by: <span className="font-semibold text-stone-700">{award.organization}</span>
                                    </p>
                                  </div>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => handleRemoveAward(selectedTeacherIdx, aIdx)}
                                  className="p-1 text-stone-400 hover:text-rose-600 rounded-md hover:bg-white transition-colors cursor-pointer shrink-0 ml-2"
                                  title="Remove Honor"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                </div>

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Custom Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-white border border-stone-200 p-6 rounded-2xl max-w-md w-full shadow-xl relative">
            <div className="flex items-start space-x-4">
              <div className="bg-rose-50 p-3 rounded-full text-rose-600 shrink-0">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-serif text-lg font-bold text-[#9c7a46] mb-1">
                  Confirm Deletion
                </h3>
                <p className="text-stone-600 text-sm font-light leading-relaxed mb-4">
                  Are you sure you want to delete <span className="font-bold text-stone-900 font-serif">"{deleteConfirm.title}"</span>? This action is permanent and cannot be undone.
                </p>
                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="px-4 py-2 border border-stone-300 bg-white hover:bg-stone-50 text-xs font-semibold text-stone-600 hover:text-stone-850 rounded-lg transition-all cursor-pointer uppercase tracking-wider"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={executeDelete}
                    className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-xs font-semibold text-white rounded-lg transition-all cursor-pointer uppercase tracking-wider flex items-center space-x-1.5 shadow-sm"
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

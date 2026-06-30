/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Award, Calendar, BookOpen, Clock, CheckCircle, Sparkles, ShieldCheck, Lock, ArrowRight } from 'lucide-react';
import { ClassSchedule, Registration } from '../types';

interface RegistrationFormProps {
  schedules: ClassSchedule[];
  preSelectedClassId?: string;
  onRegisterSubmit: (registration: Omit<Registration, 'id' | 'registrationDate' | 'status'>) => void;
  currentStudent: { id: string; name: string; email: string; phone: string } | null;
  onNavigateToLogin: () => void;
}

export default function RegistrationForm({ 
  schedules, 
  preSelectedClassId, 
  onRegisterSubmit,
  currentStudent,
  onNavigateToLogin
}: RegistrationFormProps) {
  const [formData, setFormData] = useState({
    studentName: '',
    age: '',
    parentName: '',
    email: '',
    phone: '',
    selectedClassId: '',
    experience: 'None',
    notes: ''
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [createdRecord, setCreatedRecord] = useState<any>(null);

  // Auto pre-fill with student account profile info when logged in
  useEffect(() => {
    if (currentStudent) {
      setFormData(prev => ({
        ...prev,
        studentName: prev.studentName || currentStudent.name,
        email: prev.email || currentStudent.email,
        phone: prev.phone || currentStudent.phone
      }));
    }
  }, [currentStudent]);

  useEffect(() => {
    if (preSelectedClassId) {
      setFormData(prev => ({ ...prev, selectedClassId: preSelectedClassId }));
    } else if (schedules.length > 0 && !formData.selectedClassId) {
      setFormData(prev => ({ ...prev, selectedClassId: schedules[0].id }));
    }
  }, [preSelectedClassId, schedules]);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.studentName.trim()) newErrors.studentName = 'Student name is required';
    if (!formData.age.trim() || isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      newErrors.age = 'A valid positive age is required';
    } else if (Number(formData.age) < 18 && !formData.parentName.trim()) {
      newErrors.parentName = 'Parent/Guardian name is required for students under 18';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please provide a valid email format';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s-]{8,15}$/.test(formData.phone)) {
      newErrors.phone = 'Please provide a valid phone format';
    }

    if (!formData.selectedClassId) newErrors.selectedClassId = 'Please select a dance course';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentStudent) {
      setError('auth', 'You must be logged in to submit this form.');
      return;
    }
    if (!validate()) return;

    setIsSubmitting(true);
    
    // Simulate API submission latency
    setTimeout(() => {
      const selectedClass = schedules.find(s => s.id === formData.selectedClassId);
      
      onRegisterSubmit({
        studentName: formData.studentName,
        age: Number(formData.age),
        parentName: Number(formData.age) < 18 ? formData.parentName : undefined,
        email: formData.email,
        phone: formData.phone,
        selectedClassId: formData.selectedClassId,
        selectedClassName: selectedClass ? selectedClass.className : 'Kuchipudi Course',
        experience: formData.experience,
        notes: formData.notes
      });

      setCreatedRecord({
        studentName: formData.studentName,
        className: selectedClass ? selectedClass.className : 'Kuchipudi Course',
        timeSlot: selectedClass ? `${selectedClass.dayOfWeek} at ${selectedClass.timeSlot}` : '',
        email: formData.email
      });

      setIsSubmitting(false);
      setIsSuccess(true);
      
      // Reset form (keep student credentials filled in)
      setFormData({
        studentName: currentStudent ? currentStudent.name : '',
        age: '',
        parentName: '',
        email: currentStudent ? currentStudent.email : '',
        phone: currentStudent ? currentStudent.phone : '',
        selectedClassId: schedules[0]?.id || '',
        experience: 'None',
        notes: ''
      });
    }, 1200);
  };

  // Helper setError to display validation/auth logs
  const setError = (field: string, msg: string) => {
    setErrors(prev => ({ ...prev, [field]: msg }));
  };

  const isMinor = formData.age !== '' && Number(formData.age) < 18;

  const currentSelectedClass = schedules.find(s => s.id === formData.selectedClassId);

  return (
    <div className="bg-[#faf9f6] py-12 sm:py-16 md:py-20 text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#9c7a46] font-semibold text-sm tracking-widest uppercase block mb-3">
            Begin Your Classical Dance Journey
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#9c7a46] tracking-tight mb-4">
            Student Registration
          </h2>
          <div className="h-[1px] w-24 bg-[#c5a059] mx-auto my-4 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#faf9f6] px-2 text-[#9c7a46]">
              ✦
            </div>
          </div>
          <p className="text-stone-600 text-lg font-light leading-relaxed">
            Submit an enrollment inquiry below. Only registered accounts can submit. Our admissions coordinator will review and contact you.
          </p>
        </div>

        {/* STEPS TIMELINE ROADMAP */}
        <div className="max-w-4xl mx-auto mb-16 bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-xs">
          <div className="text-center mb-6">
            <h3 className="font-serif text-lg font-bold text-[#9c7a46] flex items-center justify-center space-x-2">
              <Sparkles className="h-4.5 w-4.5" />
              <span>Simple 3-Step Enrollment Process</span>
            </h3>
            <p className="text-stone-400 text-xs mt-1">Follow these steps to secure your traditional Gurukul placement</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className={`relative p-4 rounded-xl border transition-all ${currentStudent ? 'bg-emerald-50/40 border-emerald-200' : 'bg-amber-50/25 border-[#c5a059]/30'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${currentStudent ? 'bg-emerald-600 text-white' : 'bg-[#c5a059] text-white'}`}>
                  {currentStudent ? '✓' : '1'}
                </span>
                <h4 className="font-serif font-bold text-[#9c7a46] text-sm">Create Account</h4>
              </div>
              <p className="text-stone-500 text-xs font-light leading-relaxed">
                Sign in or register a Student Account. This validates your registration and email updates.
              </p>
              {currentStudent && (
                <span className="absolute top-4 right-4 text-emerald-600 text-[10px] font-bold">Done</span>
              )}
            </div>

            {/* Step 2 */}
            <div className={`relative p-4 rounded-xl border transition-all ${currentStudent && !isSuccess ? 'bg-amber-50/25 border-[#c5a059]/40' : isSuccess ? 'bg-emerald-50/40 border-emerald-200' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isSuccess ? 'bg-emerald-600 text-white' : currentStudent ? 'bg-[#c5a059] text-white' : 'bg-stone-200 text-stone-600'}`}>
                  {isSuccess ? '✓' : '2'}
                </span>
                <h4 className="font-serif font-bold text-[#9c7a46] text-sm">Class Inquiry</h4>
              </div>
              <p className="text-stone-500 text-xs font-light leading-relaxed">
                Fill in student details, age, prior dance training, and pick your target Kuchipudi batch schedule.
              </p>
              {isSuccess && (
                <span className="absolute top-4 right-4 text-emerald-600 text-[10px] font-bold">Done</span>
              )}
            </div>

            {/* Step 3 */}
            <div className={`relative p-4 rounded-xl border transition-all ${isSuccess ? 'bg-amber-50/30 border-[#c5a059]/45' : 'bg-stone-50 border-stone-200'}`}>
              <div className="flex items-center space-x-3 mb-2">
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${isSuccess ? 'bg-[#c5a059] text-white' : 'bg-stone-200 text-stone-600'}`}>
                  3
                </span>
                <h4 className="font-serif font-bold text-[#9c7a46] text-sm">Guru Interview</h4>
              </div>
              <p className="text-stone-500 text-xs font-light leading-relaxed">
                Guru Srimayi Devi holds a brief assessment to finalize your placement and schedule trial sessions.
              </p>
            </div>
          </div>
        </div>

        {/* Content Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start max-w-6xl mx-auto">
          
          {/* Left: Interactive Class Details Preview (4 Columns) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-28">
            <div className="bg-white border border-stone-200 p-6 rounded-2xl shadow-xs">
              <h3 className="font-serif text-lg font-bold text-[#9c7a46] border-b border-stone-200 pb-3 mb-4">
                Selected Course Details
              </h3>
              
              {currentSelectedClass ? (
                <div className="space-y-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest font-mono text-[#9c7a46] font-bold bg-stone-100 px-2 py-1 rounded border border-stone-200">
                      {currentSelectedClass.level}
                    </span>
                    <h4 className="font-serif text-base sm:text-lg font-bold text-stone-900 mt-2 leading-snug">
                      {currentSelectedClass.className}
                    </h4>
                  </div>

                  <div className="space-y-2 text-xs sm:text-sm text-stone-650 font-light pt-2">
                    <p className="flex items-center">
                      <Calendar className="h-4 w-4 mr-2 text-[#9c7a46] shrink-0" />
                      <span>{currentSelectedClass.dayOfWeek}s</span>
                    </p>
                    <p className="flex items-center">
                      <Clock className="h-4 w-4 mr-2 text-[#9c7a46] shrink-0" />
                      <span>{currentSelectedClass.timeSlot} ({currentSelectedClass.duration})</span>
                    </p>
                    <p className="flex items-center">
                      <User className="h-4 w-4 mr-2 text-[#9c7a46] shrink-0" />
                      <span>Instructor: {currentSelectedClass.instructor}</span>
                    </p>
                    <p className="flex items-center">
                      <Award className="h-4 w-4 mr-2 text-[#9c7a46] shrink-0" />
                      <span>Target: {currentSelectedClass.ageGroup}</span>
                    </p>
                  </div>

                  <p className="text-xs text-stone-550 italic border-t border-stone-200 pt-3 leading-relaxed">
                    "{currentSelectedClass.description}"
                  </p>
                </div>
              ) : (
                <p className="text-sm text-stone-500 italic">Please select a course to see curriculum information.</p>
              )}
            </div>

            {/* Quick trust features */}
            <div className="bg-white border border-stone-200 p-6 rounded-2xl text-xs sm:text-sm space-y-4 text-stone-650 shadow-xs">
              <div className="flex items-start space-x-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <p className="font-light leading-relaxed">
                  <span className="font-semibold text-[#9c7a46] block mb-0.5">Secure Admissions Process</span>
                  Your enrollment information is secure and will only be shared with Academy instructors and directors.
                </p>
              </div>
              <div className="flex items-start space-x-3">
                <Sparkles className="h-5 w-5 text-[#9c7a46] shrink-0 mt-0.5" />
                <p className="font-light leading-relaxed">
                  <span className="font-semibold text-[#9c7a46] block mb-0.5">Introductory Class</span>
                  Your enrollment includes a complimentary 30-minute posture evaluation and trial session.
                </p>
              </div>
            </div>
          </div>

          {/* Right: Registration Form Core or Login Prompt (8 Columns) */}
          <div className="lg:col-span-8 bg-white border border-stone-200 p-6 sm:p-10 rounded-2xl shadow-sm">
            {!currentStudent ? (
              /* RESTRICTED ACCESS LOCK BOX */
              <div className="text-center py-12 px-4 space-y-6">
                <div className="bg-amber-50 text-amber-600 p-4 rounded-full inline-block border border-amber-200">
                  <Lock className="h-10 w-10 text-[#9c7a46]" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl font-bold text-stone-950">
                    Authentication Required
                  </h3>
                  <p className="text-stone-500 text-sm max-w-md mx-auto leading-relaxed font-light">
                    To prevent unauthorized form submissions and secure your candidate profile, registration is restricted to authenticated student accounts. 
                  </p>
                </div>

                <div className="bg-stone-50 p-6 rounded-xl border border-stone-200 max-w-md mx-auto text-left space-y-3">
                  <span className="text-[10px] uppercase font-mono font-bold text-[#9c7a46] tracking-wider block bg-[#faf6f0] border border-[#c5a059]/20 px-2 py-0.5 rounded w-fit">
                    Account benefits
                  </span>
                  <ul className="text-xs text-stone-650 space-y-2 list-disc list-inside font-light">
                    <li>Submit official academy admissions</li>
                    <li>Secure communications with Guru Srimayi Devi</li>
                    <li>Pre-fill student info on multiple forms</li>
                    <li>Verify enrollment status</li>
                  </ul>
                </div>

                <div className="pt-4">
                  <button
                    onClick={onNavigateToLogin}
                    className="group relative inline-flex items-center justify-center space-x-2 px-8 py-3 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs tracking-wider uppercase font-extrabold rounded-lg shadow-md transition-all cursor-pointer"
                  >
                    <span>Sign In or Register Account</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>
                </div>
              </div>
            ) : isSuccess ? (
              <div className="text-center py-10 space-y-6">
                <div className="bg-emerald-50 text-emerald-600 p-4 rounded-full inline-block border border-emerald-200">
                  <CheckCircle className="h-14 w-14" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-serif text-2xl sm:text-3xl font-bold text-stone-900">
                    Enrollment Submitted!
                  </h3>
                  <p className="text-stone-600 text-sm sm:text-base font-light max-w-lg mx-auto">
                    Thank you, <span className="font-semibold text-stone-900">{createdRecord?.studentName}</span>. We have received your request for the <span className="font-semibold text-stone-900">{createdRecord?.className}</span>.
                  </p>
                </div>

                <div className="bg-stone-50 border border-stone-200 p-6 rounded-xl max-w-md mx-auto text-left text-sm space-y-3.5">
                  <h4 className="font-serif font-bold text-[#9c7a46] border-b border-stone-200 pb-2 text-center sm:text-left flex items-center justify-between">
                    <span>What happens next?</span>
                    <span className="text-[10px] text-emerald-700 font-sans tracking-wide uppercase px-1.5 py-0.5 bg-emerald-50 rounded border border-emerald-200">Recommended</span>
                  </h4>
                  <p className="text-xs text-stone-600 leading-relaxed font-light">
                    Want to connect with the owners instantly? Tap below to notify them on WhatsApp:
                  </p>
                  <a 
                    href={`https://wa.me/919573692538?text=${encodeURIComponent(
                      `Hello! I have just registered a student for Natyakriya Academy.\n\nStudent Name: ${createdRecord?.studentName || ''}\nClass Selected: ${createdRecord?.className || ''}\n\nPlease let me know the next steps for orientation!`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center space-x-2 w-full py-2.5 px-4 bg-[#25D366] hover:bg-[#22c35e] text-white rounded-lg font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
                  >
                    <svg className="h-4.5 w-4.5 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.455L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.963C16.488 2.01 14.04 1.012 11.45 1.01c-5.44 0-9.866 4.372-9.87 9.802 0 1.96.512 3.878 1.483 5.581l-.97 3.538 3.654-.955zm11.722-6.52c-.312-.156-1.848-.91-2.127-1.01-.279-.1-.482-.15-.68.15-.199.3-.77.97-.943 1.17-.173.201-.347.227-.66.071-1.127-.565-1.907-1.002-2.664-2.299-.199-.34-.199-.589-.043-.745.14-.14.312-.363.468-.545.156-.182.208-.312.312-.52.104-.207.052-.389-.026-.545-.078-.156-.682-1.642-.934-2.25-.246-.593-.497-.513-.68-.522-.177-.008-.379-.01-.58-.01-.202 0-.53.076-.807.379-.278.303-1.062 1.037-1.062 2.529 0 1.492 1.085 2.932 1.236 3.134.152.202 2.137 3.262 5.176 4.57.722.311 1.285.498 1.724.638.725.23 1.385.197 1.905.12.58-.088 1.848-.756 2.11-1.45.263-.693.263-1.287.185-1.411-.078-.124-.279-.201-.59-.356z" />
                    </svg>
                    <span>Send WhatsApp Confirmation</span>
                  </a>

                  <div className="h-[1px] bg-stone-200 my-2" />

                  <p className="text-xs text-stone-500 leading-relaxed font-light">
                    1. A confirmation copy of this registration has been sent to <span className="font-medium text-stone-900">{createdRecord?.email}</span>.
                  </p>
                  <p className="text-xs text-stone-555 leading-relaxed font-light">
                    2. Our administrator will contact you via phone or email to schedule your orientation.
                  </p>
                  <p className="text-xs text-stone-555 leading-relaxed font-light">
                    3. On your first day, please wear loose fitting cotton clothes and bring a water bottle.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => setIsSuccess(false)}
                    className="px-6 py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs uppercase font-bold tracking-wider rounded-lg transition-colors cursor-pointer"
                  >
                    Register Another Student
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
                
                {/* Section titles */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h3 className="font-serif text-xl sm:text-2xl font-bold text-[#9c7a46]">
                      Admissions Form
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-500 font-light mt-1">Fields marked with * are mandatory.</p>
                  </div>
                  <div className="bg-emerald-50 text-emerald-800 text-[11px] font-medium py-1 px-3 rounded-lg border border-emerald-150 flex items-center space-x-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                    <span>Submitting as: {currentStudent.name}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Student Name */}
                  <div className="space-y-1.5">
                    <label htmlFor="studentName" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Student Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        id="studentName"
                        name="studentName"
                        value={formData.studentName}
                        onChange={handleChange}
                        placeholder="First and last name"
                        className={`pl-10 w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10 ${
                          errors.studentName
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-stone-300'
                        }`}
                      />
                    </div>
                    {errors.studentName && <span className="text-rose-500 text-xs font-light">{errors.studentName}</span>}
                  </div>

                  {/* Student Age */}
                  <div className="space-y-1.5">
                    <label htmlFor="age" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Student Age *
                    </label>
                    <input
                      type="number"
                      id="age"
                      name="age"
                      min="1"
                      max="100"
                      value={formData.age}
                      onChange={handleChange}
                      placeholder="e.g. 9 or 24"
                      className={`w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10 ${
                        errors.age
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-stone-300'
                      }`}
                    />
                    {errors.age && <span className="text-rose-500 text-xs font-light">{errors.age}</span>}
                  </div>
                </div>

                {/* Parent/Guardian name (rendered only if age < 18) */}
                {isMinor && (
                  <div className="space-y-1.5 bg-stone-50 p-4 rounded-lg border border-dashed border-stone-300">
                    <label htmlFor="parentName" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Parent / Guardian Name *
                    </label>
                    <input
                      type="text"
                      id="parentName"
                      name="parentName"
                      value={formData.parentName}
                      onChange={handleChange}
                      placeholder="Mother or Father name"
                      className={`w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10 ${
                        errors.parentName
                          ? 'border-rose-400 focus:ring-rose-200'
                          : 'border-stone-300'
                      }`}
                    />
                    {errors.parentName && <span className="text-rose-500 text-xs font-light">{errors.parentName}</span>}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Email */}
                  <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Email Address *
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="yourname@domain.com"
                        className={`pl-10 w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10 ${
                          errors.email
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-stone-300'
                        }`}
                      />
                    </div>
                    {errors.email && <span className="text-rose-500 text-xs font-light">{errors.email}</span>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1.5">
                    <label htmlFor="phone" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Phone Number *
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <input
                        type="text"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. 987-654-3210"
                        className={`pl-10 w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10 ${
                          errors.phone
                            ? 'border-rose-400 focus:ring-rose-200'
                            : 'border-stone-300'
                        }`}
                      />
                    </div>
                    {errors.phone && <span className="text-rose-500 text-xs font-light">{errors.phone}</span>}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Class Selection Dropdown */}
                  <div className="space-y-1.5">
                    <label htmlFor="selectedClassId" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Desired Course *
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                      <select
                        id="selectedClassId"
                        name="selectedClassId"
                        value={formData.selectedClassId}
                        onChange={handleChange}
                        className={`pl-10 w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10 ${
                          errors.selectedClassId
                            ? 'border-rose-400 focus:ring-rose-200 bg-white'
                            : 'border-stone-300 bg-white'
                        }`}
                      >
                        {schedules.map((course) => (
                          <option key={course.id} value={course.id} className="bg-white text-stone-900">
                            {course.className} ({course.level})
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.selectedClassId && <span className="text-rose-500 text-xs font-light">{errors.selectedClassId}</span>}
                  </div>

                  {/* Dance Experience */}
                  <div className="space-y-1.5">
                    <label htmlFor="experience" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                      Previous Dance Training
                    </label>
                    <select
                      id="experience"
                      name="experience"
                      value={formData.experience}
                      onChange={handleChange}
                      className="w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10"
                    >
                      <option value="None" className="bg-white text-stone-900">Absolute Beginner (No prior experience)</option>
                      <option value="1-2 years" className="bg-white text-stone-900">1 - 2 Years of classical training</option>
                      <option value="3-5 years" className="bg-white text-stone-900">3 - 5 Years of classical training</option>
                      <option value="5+ years" className="bg-white text-stone-900">5+ Years (Advanced or other classical style)</option>
                    </select>
                  </div>
                </div>

                {/* Additional Notes */}
                <div className="space-y-1.5">
                  <label htmlFor="notes" className="block text-xs font-bold text-stone-600 uppercase tracking-wide">
                    Additional Notes & Medical Disclosures (Optional)
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    rows={3}
                    value={formData.notes}
                    onChange={handleChange}
                    placeholder="Tell us about the student's goals, schedules, or any specific health disclosures we should know."
                    className="w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:border-[#c5a059] focus:ring-[#c5a059]/10 placeholder-stone-400"
                  />
                </div>

                {/* Submit Trigger */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-[#c5a059] hover:bg-[#b08b49] text-white text-sm font-bold tracking-widest uppercase rounded-lg shadow-sm transition-colors duration-300 flex items-center justify-center space-x-2 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                        <span>Processing Inquiry...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Registration Inquiry</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}

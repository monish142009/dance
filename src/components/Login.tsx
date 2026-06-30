/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Landmark, Sparkles, ArrowRight, User, Mail, Phone, UserCheck, KeyRound } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
  onStudentLoginSuccess: (student: { id: string; name: string; email: string; phone: string }) => void;
}

export default function Login({ onLoginSuccess, onStudentLoginSuccess }: LoginProps) {
  // Navigation tabs
  const [showAdminForm, setShowAdminForm] = useState(false);
  const [studentAction, setStudentAction] = useState<'login' | 'signup'>('login');

  // Input states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // Password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status states
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetFields = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setAdminPassword('');
    setError('');
    setSuccess('');
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminPassword.trim()) {
      setError('Please enter your administrator password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (adminPassword === 'password-2009') {
        onLoginSuccess();
        setAdminPassword('');
      } else {
        setError('Incorrect security credentials. Access is restricted to academy owners.');
      }
      setIsSubmitting(false);
    }, 800);
  };

  const handleStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (studentAction === 'signup') {
      if (!name.trim()) return setError('Please enter your full name.');
      if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Please enter a valid email.');
      if (!phone.trim()) return setError('Please enter your phone number.');
      if (!password.trim() || password.length < 4) return setError('Password must be at least 4 characters.');

      setIsSubmitting(true);

      setTimeout(() => {
        try {
          const rawStudents = localStorage.getItem('kuchipudi_students') || '[]';
          const students = JSON.parse(rawStudents);

          // Check if email already exists
          const exists = students.find((s: any) => s.email.toLowerCase() === email.toLowerCase());
          if (exists) {
            setError('This email is already registered. Please log in.');
            setIsSubmitting(false);
            return;
          }

          const newStudent = {
            id: `student-${Date.now()}`,
            name: name.trim(),
            email: email.trim(),
            phone: phone.trim(),
            password: password, // Simple local-only storage password
            joinedDate: new Date().toLocaleDateString()
          };

          students.push(newStudent);
          localStorage.setItem('kuchipudi_students', JSON.stringify(students));
          setSuccess('Account created successfully! Logging you in...');

          setTimeout(() => {
            onStudentLoginSuccess({
              id: newStudent.id,
              name: newStudent.name,
              email: newStudent.email,
              phone: newStudent.phone
            });
            resetFields();
            setIsSubmitting(false);
          }, 1000);

        } catch (err) {
          setError('Failed to create account. Please try again.');
          setIsSubmitting(false);
        }
      }, 1000);

    } else {
      // Student login
      if (!email.trim()) return setError('Please enter your registered email.');
      if (!password.trim()) return setError('Please enter your password.');

      setIsSubmitting(true);

      setTimeout(() => {
        try {
          const rawStudents = localStorage.getItem('kuchipudi_students') || '[]';
          const students = JSON.parse(rawStudents);

          const student = students.find(
            (s: any) => s.email.toLowerCase() === email.toLowerCase() && s.password === password
          );

          if (!student) {
            setError('Invalid email address or password. Please try again.');
            setIsSubmitting(false);
            return;
          }

          setSuccess(`Welcome back, ${student.name}!`);

          setTimeout(() => {
            onStudentLoginSuccess({
              id: student.id,
              name: student.name,
              email: student.email,
              phone: student.phone
            });
            resetFields();
            setIsSubmitting(false);
          }, 1000);

        } catch (err) {
          setError('Login failed. Please try again.');
          setIsSubmitting(false);
        }
      }, 1000);
    }
  };

  return (
    <div className="bg-[#faf9f6] min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-stone-800">
      <div className="max-w-md w-full space-y-6 bg-white border border-stone-200 p-8 sm:p-10 rounded-2xl shadow-sm relative overflow-hidden">
        
        {/* Artistic background accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full -translate-y-16 translate-x-16 blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c5a059]/5 rounded-full translate-y-16 -translate-x-16 blur-xl" />

        {!showAdminForm ? (
          /* Student Portal View */
          <div className="relative z-10 space-y-6">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-[#faf6f0] text-[#9c7a46] border border-[#c5a059]/35 rounded-full flex items-center justify-center shadow-xs mb-3">
                <UserCheck className="h-6 w-6" />
              </div>
              <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#9c7a46] leading-tight">
                {studentAction === 'login' ? 'Student Sign In' : 'Create Student Account'}
              </h2>
              <p className="text-stone-500 font-light text-xs sm:text-sm mt-1.5 leading-relaxed">
                {studentAction === 'login'
                  ? 'Access your student dashboard and submit course enrollment forms.'
                  : 'Register your student credentials to submit official admission forms.'}
              </p>
            </div>

            {/* Student action switcher */}
            <div className="flex bg-stone-100 p-1 rounded-lg">
              <button
                type="button"
                onClick={() => { setStudentAction('login'); setError(''); setSuccess(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  studentAction === 'login'
                    ? 'bg-white text-stone-850 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setStudentAction('signup'); setError(''); setSuccess(''); }}
                className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                  studentAction === 'signup'
                    ? 'bg-white text-stone-850 shadow-xs'
                    : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                Create Account
              </button>
            </div>

            <form onSubmit={handleStudentSubmit} className="space-y-4">
              {studentAction === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Full Name *</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="e.g. Anjali Rao"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="pl-10 w-full px-4 py-2 bg-white text-stone-900 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Email Address *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type="email"
                    placeholder="student@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10 w-full px-4 py-2 bg-white text-stone-900 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                  />
                </div>
              </div>

              {studentAction === 'signup' && (
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Phone Number *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                    <input
                      type="text"
                      placeholder="e.g. +91 9876543210"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-10 w-full px-4 py-2 bg-white text-stone-900 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Password *</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-4 py-2 bg-white text-stone-900 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-xs font-medium">⚠️ {error}</div>}
              {success && <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 p-3 rounded-lg text-xs font-medium">✓ {success}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-3 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-sm transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:bg-stone-200 disabled:text-stone-400"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Processing Portal Access...</span>
                  </>
                ) : (
                  <>
                    <span>{studentAction === 'login' ? 'Sign In to Portal' : 'Register Account'}</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setShowAdminForm(true); resetFields(); }}
                className="text-[11px] text-[#9c7a46] hover:underline hover:text-[#b08b49] font-medium cursor-pointer"
              >
                Academy Administrator? Authenticate here
              </button>
            </div>
          </div>
        ) : (
          /* Owner Administration View */
          <div className="relative z-10 space-y-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto h-12 w-12 bg-stone-150 text-[#9c7a46] border border-stone-200 rounded-full flex items-center justify-center shadow-xs mb-3">
                <KeyRound className="h-6 w-6 animate-pulse" />
              </div>
              <span className="text-stone-500 text-[9px] tracking-widest uppercase font-mono font-bold block">
                Owner Access Terminal
              </span>
              <h2 className="font-serif text-xl sm:text-2xl font-extrabold text-[#9c7a46] leading-tight mt-1">
                Administrative Login
              </h2>
              <p className="text-stone-500 font-light text-xs sm:text-sm mt-1.5 leading-relaxed">
                Academy administrators can update schedules, publish gallery content, and approve/edit enrollment inquiries.
              </p>
            </div>

            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <label className="text-xs font-bold text-stone-600 uppercase tracking-wide">Owner Access Key</label>
                  <span className="text-[10px] text-stone-400 italic">Restricted Entry</span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                  <input
                    type={showAdminPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={adminPassword}
                    onChange={(e) => setAdminPassword(e.target.value)}
                    className="pl-10 pr-10 w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border border-stone-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#c5a059]/15 focus:border-[#c5a059] font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowAdminPassword(!showAdminPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                  >
                    {showAdminPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-xs font-medium">⚠️ {error}</div>}

              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative w-full py-3 bg-[#c5a059] hover:bg-[#b08b49] text-white text-xs font-bold tracking-widest uppercase rounded-lg shadow-sm transition-colors duration-300 flex items-center justify-center space-x-2 cursor-pointer disabled:bg-stone-200"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                    <span>Validating credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate Access</span>
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => { setShowAdminForm(false); resetFields(); }}
                className="text-[11px] text-[#9c7a46] hover:underline hover:text-[#b08b49] font-medium cursor-pointer"
              >
                Return to Student Sign In
              </button>
            </div>
          </div>
        )}

        {/* Security / Quality lock status */}
        <div className="text-center pt-4 border-t border-stone-200">
          <div className="inline-flex items-center space-x-1.5 text-[10px] text-stone-400 font-light">
            <Sparkles className="h-3 w-3 text-[#c5a059]" />
            <span>Guru-Shishya Parampara Digital Space.</span>
          </div>
        </div>

      </div>
    </div>
  );
}

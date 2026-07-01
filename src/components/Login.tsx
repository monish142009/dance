/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Sparkles, ArrowRight, KeyRound } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  // Input states
  const [adminPassword, setAdminPassword] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);

  // Status states
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!adminPassword.trim()) {
      setError('Please enter your administrator password.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      if (adminPassword === '12345') {
        onLoginSuccess();
        setAdminPassword('');
      } else {
        setError('Incorrect security credentials. Access is restricted to academy owners.');
      }
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="bg-[#faf9f6] min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-stone-800">
      <div className="max-w-md w-full space-y-6 bg-white border border-stone-200 p-8 sm:p-10 rounded-2xl shadow-sm relative overflow-hidden">
        
        {/* Artistic background accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full -translate-y-16 translate-x-16 blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c5a059]/5 rounded-full translate-y-16 -translate-x-16 blur-xl" />

        {/* Owner Administration View */}
        <div className="relative z-10 space-y-6">
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
        </div>

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

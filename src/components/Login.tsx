/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Landmark, Sparkles, ArrowRight } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: () => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!password.trim()) {
      setError('Please enter your administrator password.');
      return;
    }

    setIsSubmitting(true);

    // Simulate short network verify
    setTimeout(() => {
      if (password === 'password-2009') {
        onLoginSuccess();
        setPassword('');
      } else {
        setError('Incorrect security credentials. Access is restricted to academy owners.');
      }
      setIsSubmitting(false);
    }, 800);
  };

  return (
    <div className="bg-[#faf9f6] min-h-[75vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 text-stone-800">
      
      {/* Outer framing wrapper */}
      <div className="max-w-md w-full space-y-8 bg-white border border-stone-200 p-8 sm:p-10 rounded-2xl shadow-sm relative overflow-hidden">
        
        {/* Artistic background accents */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#c5a059]/5 rounded-full -translate-y-16 translate-x-16 blur-xl" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#c5a059]/5 rounded-full translate-y-16 -translate-x-16 blur-xl" />

        {/* Brand identity header */}
        <div className="text-center relative">
          <div className="mx-auto h-12 w-12 bg-stone-100 text-[#9c7a46] border border-stone-200 rounded-full flex items-center justify-center shadow-xs mb-4">
            <Landmark className="h-6 w-6" />
          </div>
          <span className="text-stone-500 text-[10px] tracking-widest uppercase font-mono font-bold block mb-1">
            Owner Access Terminal
          </span>
          <h2 className="font-serif text-2xl sm:text-3xl font-extrabold text-[#9c7a46] leading-tight">
            Administrative Login
          </h2>
          <p className="text-stone-650 font-light text-xs sm:text-sm mt-2 leading-relaxed">
            Please enter your designated access key below to authenticate and enter the control panel dashboard.
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            
            {/* Password input label */}
            <div className="space-y-1.5">
              <div className="flex justify-between">
                <label htmlFor="accessKey" className="text-xs font-bold text-stone-600 uppercase tracking-wide">
                  Owner Access Key
                </label>
                <span className="text-[10px] text-stone-500 italic">Restricted Session</span>
              </div>
              
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="accessKey"
                  name="accessKey"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError('');
                  }}
                  placeholder="••••••••"
                  className={`pl-10 pr-10 w-full px-4 py-2.5 bg-white text-stone-900 rounded-lg border text-sm focus:outline-none focus:ring-2 font-mono ${
                    error
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-stone-300 focus:ring-[#c5a059]/10 focus:border-[#c5a059]'
                  }`}
                  autoFocus
                />
                
                {/* Visibility toggler */}
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {/* Error notifications */}
            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg text-xs leading-relaxed font-medium">
                ⚠️ {error}
              </div>
            )}

          </div>

          {/* Submit Trigger */}
          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="group relative w-full py-3 bg-[#c5a059] hover:bg-[#b08b49] text-white text-sm font-bold tracking-widest uppercase rounded-lg shadow-sm transition-colors duration-300 flex items-center justify-center space-x-2 disabled:bg-stone-100 disabled:text-stone-400 disabled:cursor-not-allowed cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                  <span>Validating session...</span>
                </>
              ) : (
                <>
                  <span>Authenticate Access</span>
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Security Warning Notice */}
        <div className="text-center pt-4 border-t border-stone-200">
          <div className="inline-flex items-center space-x-1.5 text-[10px] text-stone-500 font-light">
            <Sparkles className="h-3 w-3 text-[#c5a059]" />
            <span>Authorized administrators session lock.</span>
          </div>
        </div>

      </div>

    </div>
  );
}

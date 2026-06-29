/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Menu, X, Landmark, Lock, Award, Compass, Calendar, Image as ImageIcon, Sparkles, UserCheck } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  isAdmin: boolean;
  logout: () => void;
}

export default function Navbar({ currentTab, setCurrentTab, isAdmin, logout }: NavbarProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Compass },
    { id: 'biography', label: 'Guru & Heritage', icon: Award },
    { id: 'gallery', label: 'Media Gallery', icon: ImageIcon },
    { id: 'register', label: 'Student Enrollment', icon: UserCheck },
  ];

  const handleNavClick = (tabId: string) => {
    setCurrentTab(tabId);
    setIsOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/80 shadow-xs">
      {/* Delicate classical top strip */}
      <div className="bg-[#faf9f6] text-[#9c7a46] py-1.5 px-4 text-center text-xs tracking-[0.2em] uppercase font-serif border-b border-stone-100">
        ✨ Traditional Gurukul Training & Exquisite Classical Expressions ✨
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          {/* Logo and Academy Title */}
          <button 
            onClick={() => handleNavClick('home')}
            className="flex items-center space-x-3 text-left focus:outline-none group cursor-pointer"
          >
            <div className="bg-[#faf6f0] border-2 border-[#c5a059] p-2.5 rounded-full text-[#c5a059] group-hover:bg-white transition-colors shadow-xs">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <span className="block font-serif text-lg sm:text-xl font-bold tracking-wider text-[#9c7a46] uppercase leading-tight">
                Natyakriya
              </span>
              <span className="block font-sans text-xs sm:text-sm text-stone-500 tracking-widest uppercase font-medium">
                Kuchipudi Dance Academy
              </span>
            </div>
          </button>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex space-x-1 xl:space-x-2 items-center">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id;
              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  onClick={() => handleNavClick(item.id)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#c5a059] text-white shadow-xs font-semibold'
                      : 'text-stone-600 hover:bg-stone-50 hover:text-[#9c7a46]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Admin Access Button */}
            {isAdmin ? (
              <div className="flex items-center pl-2 ml-2 border-l border-stone-200 space-x-2">
                <button
                  id="nav-item-admin"
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium tracking-wide transition-all cursor-pointer ${
                    currentTab === 'admin'
                      ? 'bg-[#c5a059] text-white shadow-xs'
                      : 'bg-stone-50 text-[#9c7a46] hover:bg-stone-100 border border-stone-200'
                  }`}
                >
                  <Lock className="h-4 w-4 text-[#c5a059]" />
                  <span>Admin Panel</span>
                </button>
                <button
                  onClick={logout}
                  className="px-2.5 py-1.5 text-xs text-red-600 font-medium hover:underline hover:text-red-700 border border-red-200 rounded-md bg-red-50 hover:bg-red-100 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <button
                id="nav-item-login"
                onClick={() => handleNavClick('login')}
                className={`flex items-center space-x-1.5 px-3 py-2 ml-3 border-l border-stone-200 pl-3 text-sm font-medium tracking-wide transition-all rounded-lg cursor-pointer ${
                  currentTab === 'login'
                    ? 'bg-[#c5a059] text-white'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-[#9c7a46]'
                }`}
              >
                <Lock className="h-4 w-4" />
                <span>Portal Logins</span>
              </button>
            )}
          </nav>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden items-center space-x-2">
            {isAdmin && (
              <span className="bg-[#c5a059] text-white text-[10px] uppercase font-bold tracking-wider px-2 py-1 rounded">
                Admin
              </span>
            )}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-stone-600 hover:bg-stone-50 focus:outline-none cursor-pointer"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-stone-200 px-4 pt-2 pb-6 space-y-1 shadow-inner">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  isActive
                    ? 'bg-[#c5a059] text-white'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-4 mt-4 border-t border-stone-200 space-y-2">
            {isAdmin ? (
              <>
                <button
                  onClick={() => handleNavClick('admin')}
                  className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-all ${
                    currentTab === 'admin'
                      ? 'bg-[#c5a059] text-white'
                      : 'bg-stone-50 text-[#9c7a46]'
                  }`}
                >
                  <Lock className="h-5 w-5" />
                  <span>Admin Panel Control</span>
                </button>
                <button
                  onClick={() => {
                    logout();
                    setIsOpen(false);
                  }}
                  className="flex items-center justify-center w-full px-4 py-3 bg-red-50 hover:bg-red-100 text-red-600 text-sm font-semibold rounded-lg border border-red-200 transition-colors cursor-pointer"
                >
                  Logout Administrative Session
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNavClick('login')}
                className={`flex items-center space-x-3 w-full px-4 py-3 rounded-lg text-base font-medium transition-all ${
                  currentTab === 'login'
                    ? 'bg-[#c5a059] text-white'
                    : 'text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Lock className="h-5 w-5" />
                <span>Owner / Admin Portal Login</span>
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

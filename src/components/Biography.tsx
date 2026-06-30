/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Award, BookOpen, Star, Sparkles, Quote, Calendar, Users } from 'lucide-react';
import { InstructorProfile } from '../types';
import { ALL_TEACHERS_PROFILES } from '../data/kuchipudiData';

interface BiographyProps {
  teachers?: InstructorProfile[];
  profile?: InstructorProfile; // Optional fallback
  onRegisterClick: () => void;
}

export default function Biography({ teachers = ALL_TEACHERS_PROFILES, onRegisterClick }: BiographyProps) {
  const [activeTeacherIdx, setActiveTeacherIdx] = useState<number>(0);
  const currentProfile = teachers[activeTeacherIdx] || teachers[0] || ALL_TEACHERS_PROFILES[0];

  return (
    <div className="bg-[#faf9f6] py-12 sm:py-16 md:py-20 text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Aesthetic Page Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[#9c7a46] font-semibold text-sm tracking-widest uppercase block mb-3">
            ✦ Respected Gurus & Faculty Lineage ✦
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#9c7a46] tracking-tight mb-4">
            Our Distinguished Faculty
          </h2>
          <div className="h-[1px] w-24 bg-[#c5a059] mx-auto my-4 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#faf9f6] px-2 text-[#9c7a46]">
              ✦
            </div>
          </div>
          <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed">
            Preserving the divine heritage of classical arts through absolute devotion, decades of mastery, and expert student guidance.
          </p>
        </div>

        {/* Teacher Selection Tabs */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="bg-white border border-stone-200 p-2.5 rounded-2xl grid grid-cols-1 sm:grid-cols-3 gap-2 shadow-sm">
            {teachers.map((teacher, idx) => (
              <button
                key={teacher.name}
                onClick={() => setActiveTeacherIdx(idx)}
                className={`flex items-center space-x-3 p-3 rounded-xl transition-all cursor-pointer text-left ${
                  activeTeacherIdx === idx
                    ? 'bg-[#c5a059] text-white shadow-md'
                    : 'text-stone-600 hover:bg-stone-50 hover:text-[#9c7a46]'
                }`}
              >
                <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 border border-stone-200">
                  <img src={teacher.imageUrl} alt={teacher.name} className="w-full h-full object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className={`text-xs sm:text-sm font-bold truncate ${activeTeacherIdx === idx ? 'text-white' : 'text-stone-900'}`}>
                    {teacher.name}
                  </h4>
                  <p className={`text-[10px] truncate ${activeTeacherIdx === idx ? 'text-white/90' : 'text-stone-500'}`}>
                    {teacher.title.split('|')[0]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Major Presentation Layout (Bento-Grid style details & Image card) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 xl:gap-16 items-start mb-20">
          
          {/* Guru Image & Interactive Card (Left 5 Columns) */}
          <div className="lg:col-span-5 relative group">
            {/* Artistic border frame */}
            <div className="absolute -inset-3 rounded-2xl border-2 border-stone-250 border-dashed opacity-70 -z-10 group-hover:scale-[1.01] transition-transform duration-300"></div>
            
            <div className="bg-white border border-stone-200 p-4 rounded-2xl shadow-sm overflow-hidden">
              <div className="relative aspect-[3/4] rounded-xl overflow-hidden mb-6 bg-stone-100">
                <img 
                  src={currentProfile.imageUrl} 
                  alt={currentProfile.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900/85 via-stone-900/30 to-transparent"></div>
                
                {/* Title Overlay */}
                <div className="absolute bottom-6 left-6 right-6 text-white">
                  <span className="text-[#c5a059] text-[10px] tracking-widest uppercase font-semibold block mb-1">
                    Faculty Spotlight
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide text-white">
                    {currentProfile.name}
                  </h3>
                  <p className="text-[#c5a059] text-xs mt-1 font-light italic">
                    {currentProfile.title}
                  </p>
                </div>
              </div>

              {/* Devotional Quote Panel */}
              <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 relative">
                <Quote className="absolute -top-3 -left-1 h-8 w-8 text-stone-200 rotate-180 opacity-50" />
                <p className="text-xs italic text-stone-600 leading-relaxed text-center px-4 relative z-10">
                  {activeTeacherIdx === 0 && "Kuchipudi is not merely rhythm and expression; it is a sacred pathway where the finite human form merges with the infinite cosmos through devotion."}
                  {activeTeacherIdx === 1 && "The joy of classical dance is in its purity. Watching a student master their first posture with perfect alignment is the greatest reward of teaching."}
                  {activeTeacherIdx === 2 && "Tala (rhythm) is the breath of Kuchipudi. Once a dancer aligns their heartbeat to the rhythm, their movements become divine poetry."}
                </p>
              </div>
            </div>
          </div>

          {/* Biography & Achievements Details (Right 7 Columns) */}
          <div className="lg:col-span-7 space-y-8">
            
            {/* Biography Paragraphs */}
            <div className="space-y-6">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-[#9c7a46]">
                Biography & Journey
              </h3>
              {currentProfile.bioParagraphs.map((para, idx) => (
                <p key={idx} className="text-stone-650 leading-relaxed text-sm sm:text-base md:text-lg font-light">
                  {para}
                </p>
              ))}
            </div>

            {/* Training Timeline and Guru Lineage */}
            <div className="bg-white border border-stone-200 p-6 sm:p-8 rounded-xl space-y-6 shadow-xs">
              <div className="flex items-center space-x-3 text-[#9c7a46]">
                <BookOpen className="h-6 w-6 shrink-0" />
                <h4 className="font-serif text-xl font-bold">
                  Professional Credentials & Heritage
                </h4>
              </div>
              <ul className="space-y-4">
                {currentProfile.training.map((item, idx) => (
                  <li key={idx} className="flex items-start space-x-3 text-xs sm:text-sm md:text-base text-stone-650">
                    <span className="text-[#9c7a46] font-serif text-lg leading-none mt-1">✦</span>
                    <span className="leading-relaxed font-light">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Call to Enroll Action */}
            <div className="flex flex-col sm:flex-row items-center justify-between p-6 bg-stone-50 border border-stone-200 rounded-xl text-stone-800 shadow-xs gap-4">
              <div>
                <h4 className="font-serif text-base sm:text-lg font-semibold tracking-wide text-stone-900">
                  Learn directly from our Masters
                </h4>
                <p className="text-stone-550 text-xs sm:text-sm font-light mt-1">
                  Enrolling students of all age groups (Kids, Teens & Adults).
                </p>
              </div>
              <button 
                onClick={onRegisterClick}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#c5a059] hover:bg-[#b08b49] text-white font-semibold text-sm rounded-lg tracking-wider uppercase transition-colors shadow-xs cursor-pointer shrink-0"
              >
                Join Academy Classes
              </button>
            </div>

          </div>
        </div>

        {/* Achievements, Honors & Awards Section */}
        <div className="border-t border-stone-200 pt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            
            {/* Core Achievements */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 text-[#9c7a46] mb-2">
                <Star className="h-6 w-6" />
                <h4 className="font-serif text-2xl font-bold">
                  Key Achievements
                </h4>
              </div>
              <div className="space-y-4">
                {currentProfile.achievements.map((item, idx) => (
                  <div key={idx} className="flex items-start space-x-4 p-4 bg-white border border-stone-200 rounded-xl hover:shadow-md transition-shadow">
                    <div className="bg-stone-100 p-2 rounded-lg text-[#9c7a46] font-serif text-sm font-bold shrink-0 border border-stone-200">
                      0{idx + 1}
                    </div>
                    <p className="text-stone-650 leading-relaxed text-xs sm:text-sm md:text-base font-light">
                      {item}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Prestigious Recognitions & Awards */}
            {currentProfile.awards && currentProfile.awards.length > 0 && (
              <div className="space-y-6">
                <div className="flex items-center space-x-3 text-[#9c7a46] mb-2">
                  <Award className="h-6 w-6" />
                  <h4 className="font-serif text-2xl font-bold">
                    Prestigious Honors & Awards
                  </h4>
                </div>
                <div className="space-y-4">
                  {currentProfile.awards.map((award, idx) => (
                    <div key={idx} className="flex items-center space-x-4 p-4 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors">
                      <div className="text-center py-1.5 px-3 bg-stone-50 text-[#9c7a46] border border-stone-200 rounded-lg shrink-0">
                        <Calendar className="h-4 w-4 mx-auto mb-1 opacity-70" />
                        <span className="block font-mono text-xs font-bold">{award.year}</span>
                      </div>
                      <div>
                        <h5 className="font-serif text-sm sm:text-base md:text-lg font-bold text-[#9c7a46]">
                          {award.title}
                        </h5>
                        <p className="text-stone-500 text-xs sm:text-sm font-light mt-0.5">
                          Conferred by: <span className="font-medium text-stone-700">{award.organization}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}

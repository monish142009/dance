/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Play, ZoomIn, Calendar, ChevronLeft, ChevronRight, X, ImageIcon, Film } from 'lucide-react';
import { GalleryItem } from '../types';

interface GallerySectionProps {
  galleryItems: GalleryItem[];
}

export default function GallerySection({ galleryItems }: GallerySectionProps) {
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  // Separate items into Photos and Videos
  const photos = galleryItems.filter(item => item.type === 'image');
  const videos = galleryItems.filter(item => item.type === 'video');

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentList = selectedItem.type === 'image' ? photos : videos;
    const index = currentList.findIndex(item => item.id === selectedItem.id);
    if (index !== -1) {
      const prevIndex = index > 0 ? index - 1 : currentList.length - 1;
      setSelectedItem(currentList[prevIndex]);
    }
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!selectedItem) return;
    const currentList = selectedItem.type === 'image' ? photos : videos;
    const index = currentList.findIndex(item => item.id === selectedItem.id);
    if (index !== -1) {
      const nextIndex = index < currentList.length - 1 ? index + 1 : 0;
      setSelectedItem(currentList[nextIndex]);
    }
  };

  return (
    <div className="bg-[#faf9f6] py-16 sm:py-20 text-stone-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-[#9c7a46] font-semibold text-xs sm:text-sm tracking-widest uppercase block mb-3">
            ✦ Classical Splendor & Rhythms ✦
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-[#9c7a46] tracking-tight mb-4">
            Our Media Gallery
          </h2>
          <div className="h-[1px] w-24 bg-[#c5a059] mx-auto my-4 relative">
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#faf9f6] px-2 text-[#9c7a46]">
              ✦
            </div>
          </div>
          <p className="text-stone-600 text-base sm:text-lg font-light leading-relaxed">
            A visual anthology of classical expressions, rigorous practice routines, festive poojas, and magnificent stage performances.
          </p>
        </div>

        {/* SECTION 1: PHOTO GALLERY */}
        <div className="mb-20">
          <div className="flex items-center space-x-3 mb-8 border-b border-stone-200 pb-4">
            <div className="p-2 bg-[#9c7a46]/10 text-[#9c7a46] rounded-lg">
              <ImageIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#9c7a46] tracking-tight">
                Photo Gallery
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm font-light">
                Captured moments of classical grace and expression.
              </p>
            </div>
          </div>

          {photos.length === 0 ? (
            <div className="text-center py-12 bg-white border border-stone-200 rounded-xl shadow-xs">
              <ImageIcon className="h-10 w-10 text-stone-350 mx-auto mb-2" />
              <p className="text-stone-500 text-sm">No photos available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {photos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Image container */}
                  <div className="relative aspect-[4/3] overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={item.url}
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/5 group-hover:bg-black/25 transition-colors duration-300"></div>

                    {/* Zoom Icon Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="bg-[#c5a059] text-white p-3 rounded-full shadow-md transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
                        <ZoomIn className="h-5 w-5" />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono text-stone-500 uppercase">
                        <Calendar className="h-3 w-3 text-[#9c7a46]" />
                        <span>{item.date}</span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#9c7a46] transition-colors leading-snug">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-stone-650 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SECTION 2: VIDEO GALLERY */}
        <div>
          <div className="flex items-center space-x-3 mb-8 border-b border-stone-200 pb-4">
            <div className="p-2 bg-[#9c7a46]/10 text-[#9c7a46] rounded-lg">
              <Film className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-serif text-2xl font-bold text-[#9c7a46] tracking-tight">
                Video Showcases
              </h3>
              <p className="text-stone-500 text-xs sm:text-sm font-light">
                Recitals, rehearsals, and classical performances on video.
              </p>
            </div>
          </div>

          {videos.length === 0 ? (
            <div className="text-center py-12 bg-white border border-stone-200 rounded-xl shadow-xs">
              <Film className="h-10 w-10 text-stone-350 mx-auto mb-2" />
              <p className="text-stone-500 text-sm">No videos available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 xl:gap-8">
              {videos.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className="group bg-white border border-stone-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 cursor-pointer flex flex-col h-full"
                >
                  {/* Video container with fallback image */}
                  <div className="relative aspect-[16/10] overflow-hidden bg-stone-100 shrink-0">
                    <img
                      src={
                        item.url.includes('youtube.com/embed/') 
                          ? `https://img.youtube.com/vi/${item.url.split('/embed/')[1]?.split('?')[0]}/hqdefault.jpg`
                          : 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800'
                      }
                      alt={item.title}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-black/10 group-hover:bg-black/30 transition-colors duration-300"></div>

                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white/95 text-[#9c7a46] p-3 rounded-full shadow-lg transform group-hover:scale-110 transition-transform duration-300">
                        <Play className="h-5 w-5 fill-[#9c7a46]" />
                      </div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center space-x-1.5 text-[11px] font-mono text-stone-500 uppercase">
                        <Calendar className="h-3 w-3 text-[#9c7a46]" />
                        <span>{item.date}</span>
                      </div>
                      <h4 className="font-serif text-lg font-bold text-stone-900 group-hover:text-[#9c7a46] transition-colors leading-snug">
                        {item.title}
                      </h4>
                      {item.description && (
                        <p className="text-stone-650 text-xs sm:text-sm font-light leading-relaxed line-clamp-2">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* LIGHTBOX MODAL */}
      {selectedItem && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 p-4 sm:p-6"
          onClick={() => setSelectedItem(null)}
        >
          {/* Close Button */}
          <button
            onClick={() => setSelectedItem(null)}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white p-2.5 rounded-full z-50 border border-white/10 cursor-pointer"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Navigation Controls */}
          <button
            onClick={handlePrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full z-50 border border-white/10 cursor-pointer hidden sm:block"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full z-50 border border-white/10 cursor-pointer hidden sm:block"
          >
            <ChevronRight className="h-6 w-6" />
          </button>

          {/* Lightbox Content Card */}
          <div 
            className="relative w-full max-w-4xl max-h-[85vh] flex flex-col items-center bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl border border-white/10 p-2 sm:p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full h-[50vh] sm:h-[60vh] flex items-center justify-center relative overflow-hidden rounded-xl bg-black">
              {selectedItem.type === 'video' ? (
                selectedItem.url.includes('youtube.com') || selectedItem.url.includes('youtu.be') ? (
                  <iframe
                    src={selectedItem.url}
                    title={selectedItem.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                ) : (
                  <video
                    src={selectedItem.url}
                    controls
                    autoPlay
                    className="max-w-full max-h-full"
                  />
                )
              ) : (
                <img
                  src={selectedItem.url}
                  alt={selectedItem.title}
                  referrerPolicy="no-referrer"
                  className="max-w-full max-h-full object-contain"
                />
              )}
            </div>

            {/* Lightbox Info Bar */}
            <div className="w-full text-white pt-4 px-2 space-y-1 text-center sm:text-left">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-y-1">
                <span className="text-stone-400 text-xs font-mono">
                  Captured: {selectedItem.date}
                </span>
              </div>
              <h3 className="font-serif text-xl sm:text-2xl font-bold tracking-wide mt-1 text-[#c5a059]">
                {selectedItem.title}
              </h3>
              {selectedItem.description && (
                <p className="text-stone-300 text-sm font-light leading-relaxed max-w-3xl">
                  {selectedItem.description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

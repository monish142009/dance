/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ClassSchedule {
  id: string;
  className: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels';
  ageGroup: string;
  instructor: string;
  dayOfWeek: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';
  timeSlot: string;
  duration: string;
  description: string;
  maxStudents: number;
  registeredCount: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  url: string; // Base64 or external link
  date: string;
  category: 'Performance' | 'Classroom' | 'Festival' | 'Workshop';
}

export interface Registration {
  id: string;
  studentName: string;
  age: number;
  parentName?: string; // If minor
  email: string;
  phone: string;
  selectedClassId: string;
  selectedClassName: string;
  experience: string; // "None", "1-2 years", "3-5 years", "5+ years"
  notes?: string;
  registrationDate: string;
  status: 'Pending' | 'Approved' | 'Contacted';
}

export interface InstructorProfile {
  name: string;
  title: string;
  bioParagraphs: string[];
  training: string[];
  achievements: string[];
  awards: { year: string; title: string; organization: string }[];
  imageUrl: string;
}

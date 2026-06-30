/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { ClassSchedule, GalleryItem, InstructorProfile } from '../types';

export const ALL_TEACHERS_PROFILES: InstructorProfile[] = [
  {
    name: "Guru Srimayi Devi Prasanna",
    title: "Founder & Artistic Director | National Nritya Shiromani Awardee",
    imageUrl: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=800",
    bioParagraphs: [
      "Guru Srimayi Devi Prasanna is one of the foremost exponents of the traditional Kuchipudi dance style. Born into a family of artists in Andhra Pradesh, she began her intensive training at the tender age of six under the legendary Guru Vempati Chinna Satyam. Over three decades of dedicated practice, Srimayi has honed her craft to a degree of supreme excellence, characterized by crisp footwork, expressive abhinaya, and absolute compliance with classical shastras.",
      "She has performed at prestigious national and international festivals across 25 countries, earning rave reviews from dance critics and connoisseurs worldwide. Beyond being a stellar soloist, her choreographic works have set new milestones in modern dance dramas, combining traditional temple styles with contemporary themes.",
      "Driven by a vision to pass on this ancient heritage to the next generation, she founded Natyakriya Academy. Her teaching methodology balances rigorous physical discipline with deep emotional and spiritual understanding of Indian classical philosophy."
    ],
    training: [
      "Advanced Gurukul Training (12 years) under legendary Guru Padmabhushan Vempati Chinna Satyam, Chennai",
      "Master of Fine Arts (MFA) in Kuchipudi Dance, Potti Sreeramulu Telugu University",
      "Intensive specialization in 'Bhama Kalapam' (the crown jewel of Kuchipudi drama) and classical abhinaya"
    ],
    achievements: [
      "Choreographed and directed 15+ critically-acclaimed dance dramas including 'Srinivasa Kalyanam' and 'Ganga Tarang'",
      "Invited as a cultural ambassador by the Ministry of Culture, Government of India, for tours across Europe, USA, and Southeast Asia",
      "Established state-of-the-art training modules that have successfully trained over 1,200 students worldwide",
      "Conferred with 'Pratibha Puraskar' by the Department of Language & Culture, Government of Telangana"
    ],
    awards: [
      {
        year: "2024",
        title: "Kala Ratna National Award",
        organization: "State Cultural Association"
      },
      {
        year: "2021",
        title: "Nritya Shiromani Excellence Award",
        organization: "National Classical Dance Federation"
      },
      {
        year: "2018",
        title: "Singar Mani Title",
        organization: "Sur Singar Samsad, Mumbai"
      },
      {
        year: "2015",
        title: "Best Soloist Gold Medal",
        organization: "International Dance Congress, Paris"
      }
    ]
  },
  {
    name: "Smt. Arundhati Rao",
    title: "Senior Choreographer & Instructor | Kuchipudi MFA Gold Medalist",
    imageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=800",
    bioParagraphs: [
      "Smt. Arundhati Rao is a highly accomplished classical performer and teacher with over 15 years of instructional experience. Having graduated with a Gold Medal in MFA Kuchipudi from Potti Sreeramulu Telugu University, Arundhati specializes in making classical fundamentals approachable for younger students and adult beginners.",
      "She has choreographed numerous youth festivals and school showcase recitals. At Natyakriya Academy, she spearheads the Beginner and Intermediate curriculums, ensuring every student develops correct posture, spinal alignment, and strong rhythmic foundation (Tala)."
    ],
    training: [
      "Graduated with Gold Medal in MFA (Kuchipudi), Potti Sreeramulu Telugu University",
      "Intensive training under Guru Srimayi Devi for advanced repertoire and abhinaya techniques",
      "Specialized course in Classical Musicology and Rhythm theory (Tala Shastra)"
    ],
    achievements: [
      "Formulated the progressive 'Bal-Nritya' syllabus tailored for children ages 6 to 12, adopted as a standard pedagogy",
      "Trained over 400 beginner students, guiding them successfully to their first stage debut (Gajje Pooja)",
      "Co-choreographed the grand production 'Srinivasa Kalyanam' that toured 8 states across India"
    ],
    awards: [
      {
        year: "2023",
        title: "Best Classical Dance Educator",
        organization: "Telangana Arts Foundation"
      },
      {
        year: "2019",
        title: "Yuva Kala Bharati Award",
        organization: "Bharat Kalachar, Chennai"
      }
    ]
  },
  {
    name: "Sri Vikram Aditya",
    title: "Nattuvangam Maestro & Percussionist | Rhythm Director",
    imageUrl: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800",
    bioParagraphs: [
      "Sri Vikram Aditya is a distinguished master of Nattuvangam (the art of directing classical dance through cymbals and rhythmic chanting) and a seasoned mridangam artist. He is the heartbeat of all major live stage recitals and masterclasses at Natyakriya Academy.",
      "With over a decade of stage experience, Vikram collaborates closely with choreographers to compose complex rhythmic jatis and original music scores, providing dancers with the precise rhythmic framework needed for dynamic expression."
    ],
    training: [
      "Rigorous training in Carnatic Mridangam & Nattuvangam under the guidance of veteran guru Sri Karaikudi R. Mani",
      "Bachelor of Music (Percussion), Andhra University",
      "Conducted rhythmic ensembles for over 150 high-profile classical recitals internationally"
    ],
    achievements: [
      "Composed and executed complex live rhythmic patterns (Jatis) for original choreographies like 'Ganga Tarang'",
      "Conducted specialized Nattuvangam & Tala workshops for advanced dancers and teachers across India and USA",
      "Spearheaded the Rhythm & Footwork Synchronization modules at Natyakriya Academy, enhancing the speed and footwork accuracy of advanced cohorts"
    ],
    awards: [
      {
        year: "2022",
        title: "Laya Vidhyadhara Title",
        organization: "Classical Rhythm Academy, Bangalore"
      },
      {
        year: "2017",
        title: "Promising Percussionist Award",
        organization: "Madras Music Academy"
      }
    ]
  }
];

export const DEFAULT_INSTRUCTOR_PROFILE = ALL_TEACHERS_PROFILES[0];

export const DEFAULT_CLASSES: ClassSchedule[] = [
  {
    id: "class-1",
    className: "Prarambhik (Beginner Fundamentals)",
    level: "Beginner",
    ageGroup: "Kids (Ages 6-11)",
    instructor: "Guru Srimayi Devi",
    dayOfWeek: "Saturday",
    timeSlot: "09:00 AM - 10:30 AM",
    duration: "90 Minutes",
    description: "Introduction to basic Kuchipudi aduvus (steps), posture (Araimandi), and preliminary hand gestures (Asamyuta Hastas). Focuses on building rhythm, physical balance, and primary footwork coordinates.",
    maxStudents: 15,
    registeredCount: 8
  },
  {
    id: "class-2",
    className: "Praveshika (Intermediate Footwork & Expressions)",
    level: "Intermediate",
    ageGroup: "Teens & Adults",
    instructor: "Guru Srimayi Devi",
    dayOfWeek: "Tuesday",
    timeSlot: "05:30 PM - 07:00 PM",
    duration: "90 Minutes",
    description: "Focus on intermediate aduvus, complex rhythmic patterns (Jatis), and initial classical items like Sabdhams. Introduces 'Abhinaya' (expressive acting) through stories of mythological epics.",
    maxStudents: 12,
    registeredCount: 6
  },
  {
    id: "class-3",
    className: "Madhyama (Advanced Classical Recitals)",
    level: "Advanced",
    ageGroup: "Experienced Dancers",
    instructor: "Guru Srimayi Devi",
    dayOfWeek: "Thursday",
    timeSlot: "06:00 PM - 08:00 PM",
    duration: "120 Minutes",
    description: "Rigorous training in core Kuchipudi items including Tarangam (dancing on the rim of a brass plate), Keerthanams, and Tillanas. High emphasis on speed, precision, and complete solo performance readiness.",
    maxStudents: 10,
    registeredCount: 4
  },
  {
    id: "class-4",
    className: "Adults Classical Foundation",
    level: "Beginner",
    ageGroup: "Adults (18+)",
    instructor: "Smt. Arundhati Rao",
    dayOfWeek: "Sunday",
    timeSlot: "11:00 AM - 12:30 PM",
    duration: "90 Minutes",
    description: "Designed specifically for adults seeking a structured entry into classical dance. Combines classical footwork with core strength exercises, flexibility, and expressive storytelling.",
    maxStudents: 15,
    registeredCount: 9
  },
  {
    id: "class-5",
    className: "Varnam Specialization Masterclass",
    level: "Advanced",
    ageGroup: "Teens & Adults",
    instructor: "Guru Srimayi Devi",
    dayOfWeek: "Wednesday",
    timeSlot: "04:00 PM - 06:00 PM",
    duration: "120 Minutes",
    description: "Exclusive intensive study focusing on the intricate choreography and philosophical depth of Kuchipudi Varnams and Pada Abhinaya. Requires minimum 5 years of training.",
    maxStudents: 8,
    registeredCount: 3
  }
];

export const DEFAULT_GALLERY: GalleryItem[] = [
  {
    id: "gal-1",
    title: "Expressive Abhinaya",
    description: "Guru Srimayi Devi demonstrating 'Nava Rasas' (the nine classical emotions) during a lecture demonstration.",
    type: "image",
    url: "https://images.unsplash.com/photo-1601042879364-f3947d3f9c16?auto=format&fit=crop&q=80&w=800",
    date: "January 2026",
    category: "Classroom"
  },
  {
    id: "gal-2",
    title: "Tarangam Brass Plate Footwork",
    description: "An advanced student balancing on a brass plate with a water pot on her head, showcasing pure balance.",
    type: "image",
    url: "https://images.unsplash.com/photo-1547153760-18fc86324498?auto=format&fit=crop&q=80&w=800",
    date: "March 2026",
    category: "Performance"
  },
  {
    id: "gal-3",
    title: "Guru Srimayi Devi in Performance",
    description: "Performing Bhama Kalapam under theatrical dramatic lights at Chowdiah Hall.",
    type: "image",
    url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=800",
    date: "April 2026",
    category: "Performance"
  },
  {
    id: "gal-4",
    title: "Hand Gesture Tutorial (Mudra)",
    description: "Close-up of Mayura Mudra (peacock gesture) and Pataka Mudra, vital in the Kuchipudi story vocabulary.",
    type: "image",
    url: "https://images.unsplash.com/photo-1508962914676-134849a727f0?auto=format&fit=crop&q=80&w=800",
    date: "February 2026",
    category: "Classroom"
  },
  {
    id: "gal-5",
    title: "Academy Traditional Shrine",
    description: "The beautiful Lord Nataraja bronze deity and flower offerings in our main studio lobby.",
    type: "image",
    url: "https://images.unsplash.com/photo-1583089892943-e02e5b017b6a?auto=format&fit=crop&q=80&w=800",
    date: "Ongoing",
    category: "Festival"
  },
  {
    id: "gal-6",
    title: "Vijayadashami Studio Celebration",
    description: "Students of all ages performing Pooja and showing respects to the instruments and textbooks on the auspicious day.",
    type: "image",
    url: "https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?auto=format&fit=crop&q=80&w=800",
    date: "October 2025",
    category: "Festival"
  },
  {
    id: "gal-7",
    title: "Kuchipudi Classic Recital video",
    description: "A spectacular classical Kuchipudi dance recital demonstrating incredible footwork synchronization and divine postures.",
    type: "video",
    url: "https://www.youtube.com/embed/Z0oYpAs_ZgU",
    date: "November 2025",
    category: "Performance"
  },
  {
    id: "gal-7-2",
    title: "Senior Students Tarangam Showcase",
    description: "Advanced disciples executing the legendary Kuchipudi brass-plate dance with complex rhythmic syncopations.",
    type: "video",
    url: "https://www.youtube.com/embed/Z0oYpAs_ZgU",
    date: "December 2025",
    category: "Performance"
  },
  {
    id: "gal-7-3",
    title: "Gurukul Daily Rhythms & Footwork Practice",
    description: "An inside look at our daily Adavu practices, focusing on speed mastery, core stability, and physical stamina.",
    type: "video",
    url: "https://www.youtube.com/embed/Z0oYpAs_ZgU",
    date: "January 2026",
    category: "Classroom"
  },
  {
    id: "gal-8",
    title: "Rhythmic Alignment Workshop",
    description: "Senior students practicing footwork combinations under the direction of Sri Vikram Aditya's nattuvangam.",
    type: "image",
    url: "https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&q=80&w=800",
    date: "May 2026",
    category: "Workshop"
  },
  {
    id: "gal-9",
    title: "Divine Devotion",
    description: "Traditional classical Indian dancer portraying spiritual devotion through hand mudras and expressive facial abhinaya.",
    type: "image",
    url: "https://images.unsplash.com/photo-1615195627275-48660e90c445?auto=format&fit=crop&q=80&w=800",
    date: "February 2026",
    category: "Performance"
  },
  {
    id: "gal-10",
    title: "Intense Eye Expressions (Nayanabhinaya)",
    description: "A masterclass focused exclusively on training eye movements to convey diverse classical emotions.",
    type: "image",
    url: "https://images.unsplash.com/photo-1599707367072-cd6ada2bc375?auto=format&fit=crop&q=80&w=800",
    date: "April 2026",
    category: "Classroom"
  },
  {
    id: "gal-11",
    title: "Choreography Design Session",
    description: "Guru Srimayi mapping out dynamic geometrical stage formations with the senior performance troupe.",
    type: "image",
    url: "https://images.unsplash.com/photo-1545128485-c400e7702796?auto=format&fit=crop&q=80&w=800",
    date: "June 2026",
    category: "Workshop"
  }
];

/**
 * Discipline interface for the discipline system
 */
export interface Discipline {
  id: string;              // URL-friendly identifier (e.g., 'physics')
  name: string;           // Display name (e.g., 'Physics')
  category: string;       // Grouping category (e.g., 'natural-sciences')
  description: string;    // Full description
  moduleCount: number;    // Number of modules in this discipline
}

/**
 * Seed data for academic disciplines based on typical university majors
 * Organized by college categories with realistic discipline structure
 */

export const DISCIPLINE_SEED_DATA: Discipline[] = [
  // ==========================================
  // ARTS & LETTERS COLLEGE
  // ==========================================

  {
    id: 'art',
    name: 'Art',
    category: 'arts-letters',
    description: 'Study of visual arts, design, and artistic expression',
    moduleCount: 0
  },
  {
    id: 'communication-studies',
    name: 'Communication Studies',
    category: 'arts-letters',
    description: 'Study of human communication, media, and interpersonal relationships',
    moduleCount: 0
  },
  {
    id: 'design',
    name: 'Design',
    category: 'arts-letters',
    description: 'Study of visual communication, graphic design, and creative problem-solving',
    moduleCount: 0
  },
  {
    id: 'english',
    name: 'English',
    category: 'arts-letters',
    description: 'Study of literature, writing, and communication',
    moduleCount: 0
  },
  {
    id: 'history',
    name: 'History',
    category: 'arts-letters',
    description: 'Study of past events, societies, and historical analysis',
    moduleCount: 0
  },
  {
    id: 'humanities-religious-studies',
    name: 'Humanities & Religious Studies',
    category: 'arts-letters',
    description: 'Study of human culture, values, and religious traditions',
    moduleCount: 0
  },
  {
    id: 'music',
    name: 'Music',
    category: 'arts-letters',
    description: 'Study of musical theory, performance, and composition',
    moduleCount: 0
  },
  {
    id: 'philosophy',
    name: 'Philosophy',
    category: 'arts-letters',
    description: 'Study of fundamental questions about existence, knowledge, and ethics',
    moduleCount: 0
  },
  {
    id: 'theatre-dance',
    name: 'Theatre & Dance',
    category: 'arts-letters',
    description: 'Study of dramatic arts, performance, and movement',
    moduleCount: 0
  },
  {
    id: 'world-languages-literatures',
    name: 'World Languages & Literatures',
    category: 'arts-letters',
    description: 'Study of foreign languages, literatures, and cultural studies',
    moduleCount: 0
  },

  // ==========================================
  // BUSINESS COLLEGE
  // ==========================================

  {
    id: 'business-administration',
    name: 'Business Administration',
    category: 'business',
    description: 'Study of business operations, management, and organizational leadership',
    moduleCount: 0
  },
  {
    id: 'accounting',
    name: 'Accounting',
    category: 'business',
    description: 'Study of financial reporting, analysis, and business decision-making',
    moduleCount: 0
  },
  {
    id: 'finance',
    name: 'Finance',
    category: 'business',
    description: 'Study of financial systems, investment, and corporate finance',
    moduleCount: 0
  },
  {
    id: 'marketing',
    name: 'Marketing',
    category: 'business',
    description: 'Study of product promotion, market research, and consumer behavior',
    moduleCount: 0
  },

  // ==========================================
  // ENGINEERING & COMPUTER SCIENCE COLLEGE
  // ==========================================

  {
    id: 'civil-engineering',
    name: 'Civil Engineering',
    category: 'engineering-computer-science',
    description: 'Design and construction of infrastructure and buildings',
    moduleCount: 0
  },
  {
    id: 'computer-engineering',
    name: 'Computer Engineering',
    category: 'engineering-computer-science',
    description: 'Integration of computer science and electrical engineering',
    moduleCount: 0
  },
  {
    id: 'computer-science',
    name: 'Computer Science',
    category: 'engineering-computer-science',
    description: 'Study of computation, programming, algorithms, and computer systems',
    moduleCount: 0
  },
  {
    id: 'construction-management',
    name: 'Construction Management',
    category: 'engineering-computer-science',
    description: 'Management of construction projects and operations',
    moduleCount: 0
  },
  {
    id: 'electrical-electronic-engineering',
    name: 'Electrical and Electronic Engineering',
    category: 'engineering-computer-science',
    description: 'Study of electrical systems, electronics, and electromagnetism',
    moduleCount: 0
  },
  {
    id: 'mechanical-engineering',
    name: 'Mechanical Engineering',
    category: 'engineering-computer-science',
    description: 'Design and analysis of mechanical systems, machines, and processes',
    moduleCount: 0
  },

  // ==========================================
  // HEALTH & HUMAN SERVICES COLLEGE
  // ==========================================

  {
    id: 'communication-sciences-disorders',
    name: 'Communication Sciences & Disorders',
    category: 'health-human-services',
    description: 'Study of speech, language, and communication disorders',
    moduleCount: 0
  },
  {
    id: 'criminal-justice',
    name: 'Criminal Justice',
    category: 'health-human-services',
    description: 'Study of crime, law enforcement, and criminal justice systems',
    moduleCount: 0
  },
  {
    id: 'health-science',
    name: 'Health Science',
    category: 'health-human-services',
    description: 'Study of health systems, healthcare delivery, and wellness',
    moduleCount: 0
  },
  {
    id: 'kinesiology',
    name: 'Kinesiology',
    category: 'health-human-services',
    description: 'Study of human movement and physical activity',
    moduleCount: 0
  },
  {
    id: 'nursing',
    name: 'Nursing',
    category: 'health-human-services',
    description: 'Healthcare profession focused on patient care and health promotion',
    moduleCount: 0
  },
  {
    id: 'physical-therapy',
    name: 'Physical Therapy',
    category: 'health-human-services',
    description: 'Study of physical rehabilitation and therapeutic exercise',
    moduleCount: 0
  },
  {
    id: 'public-health',
    name: 'Public Health',
    category: 'health-human-services',
    description: 'Study of health and disease at the population level',
    moduleCount: 0
  },
  {
    id: 'recreation-parks-tourism',
    name: 'Recreation, Parks & Tourism',
    category: 'health-human-services',
    description: 'Study of leisure, recreation, and tourism management',
    moduleCount: 0
  },
  {
    id: 'social-work',
    name: 'Social Work',
    category: 'health-human-services',
    description: 'Study of social welfare, human services, and community support',
    moduleCount: 0
  },

  // ==========================================
  // NATURAL SCIENCES & MATHEMATICS COLLEGE
  // ==========================================

  {
    id: 'biological-sciences',
    name: 'Biological Sciences',
    category: 'natural-sciences-mathematics',
    description: 'Study of living organisms, including molecular biology, ecology, genetics, and physiology',
    moduleCount: 0
  },
  {
    id: 'chemistry',
    name: 'Chemistry',
    category: 'natural-sciences-mathematics',
    description: 'Study of matter, chemical reactions, and the composition of substances',
    moduleCount: 0
  },
  {
    id: 'geography',
    name: 'Geography',
    category: 'natural-sciences-mathematics',
    description: 'Study of spatial relationships, human-environment interactions, and regional analysis',
    moduleCount: 0
  },
  {
    id: 'geology',
    name: 'Geology',
    category: 'natural-sciences-mathematics',
    description: 'Study of the Earth, its materials, processes, and history',
    moduleCount: 0
  },
  {
    id: 'mathematics-statistics',
    name: 'Mathematics and Statistics',
    category: 'natural-sciences-mathematics',
    description: 'Study of numbers, quantities, structures, patterns, and data analysis',
    moduleCount: 0
  },
  {
    id: 'physics-astronomy',
    name: 'Physics & Astronomy',
    category: 'natural-sciences-mathematics',
    description: 'Study of matter, energy, fundamental forces, and celestial bodies',
    moduleCount: 0
  },

  // ==========================================
  // SOCIAL SCIENCES & INTERDISCIPLINARY STUDIES COLLEGE
  // ==========================================

  {
    id: 'anthropology',
    name: 'Anthropology',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of human societies, cultures, and human evolution',
    moduleCount: 0
  },
  {
    id: 'asian-studies',
    name: 'Asian Studies',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of Asian cultures, languages, and societies',
    moduleCount: 0
  },
  {
    id: 'economics',
    name: 'Economics',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of production, distribution, and consumption of goods and services',
    moduleCount: 0
  },
  {
    id: 'environmental-studies',
    name: 'Environmental Studies',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of environmental systems and solutions to environmental problems',
    moduleCount: 0
  },
  {
    id: 'ethnic-studies',
    name: 'Ethnic Studies',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of race, ethnicity, and cultural diversity',
    moduleCount: 0
  },
  {
    id: 'family-consumer-sciences',
    name: 'Family & Consumer Sciences',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of family dynamics, consumer behavior, and human development',
    moduleCount: 0
  },
  {
    id: 'gerontology',
    name: 'Gerontology',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of aging and the aging process',
    moduleCount: 0
  },
  {
    id: 'liberal-studies',
    name: 'Liberal Studies',
    category: 'social-sciences-interdisciplinary',
    description: 'Interdisciplinary study of humanities, social sciences, and natural sciences',
    moduleCount: 0
  },
  {
    id: 'nutrition-food-dietetics',
    name: 'Nutrition, Food & Dietetics',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of nutrition, food science, and dietary health',
    moduleCount: 0
  },
  {
    id: 'political-science',
    name: 'Political Science',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of government, politics, and political behavior',
    moduleCount: 0
  },
  {
    id: 'psychology',
    name: 'Psychology',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of human behavior and mental processes',
    moduleCount: 0
  },
  {
    id: 'public-policy-administration',
    name: 'Public Policy & Administration',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of public policy, government administration, and public affairs',
    moduleCount: 0
  },
  {
    id: 'social-science',
    name: 'Social Science',
    category: 'social-sciences-interdisciplinary',
    description: 'Interdisciplinary study of human society and social behavior',
    moduleCount: 0
  },
  {
    id: 'sociology',
    name: 'Sociology',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of society, social institutions, and social relationships',
    moduleCount: 0
  },
  {
    id: 'womens-gender-studies',
    name: 'Women\'s & Gender Studies',
    category: 'social-sciences-interdisciplinary',
    description: 'Study of gender roles, feminism, and gender equality',
    moduleCount: 0
  },

  // ==========================================
  // EDUCATION COLLEGE
  // ==========================================

  {
    id: 'education',
    name: 'Education',
    category: 'education',
    description: 'Study of teaching, learning, and educational practice',
    moduleCount: 0
  },
  {
    id: 'teaching-credentials',
    name: 'Teaching Credentials',
    category: 'education',
    description: 'Professional preparation for teaching certification',
    moduleCount: 0
  }
];

/**
 * Helper functions for working with disciplines
 */
export const getDisciplinesByCategory = (category: string): Discipline[] => {
  return DISCIPLINE_SEED_DATA.filter(discipline => discipline.category === category);
};

export const getDisciplineById = (id: string): Discipline | undefined => {
  return DISCIPLINE_SEED_DATA.find(discipline => discipline.id === id);
};

export const getAllCategories = (): string[] => {
  return [...new Set(DISCIPLINE_SEED_DATA.map(discipline => discipline.category))];
};

export const getTotalDisciplineCount = (): number => {
  return DISCIPLINE_SEED_DATA.length;
};

export const getDisciplineCountByCategory = (): Record<string, number> => {
  const counts: Record<string, number> = {};
  DISCIPLINE_SEED_DATA.forEach(discipline => {
    counts[discipline.category] = (counts[discipline.category] || 0) + 1;
  });
  return counts;
};

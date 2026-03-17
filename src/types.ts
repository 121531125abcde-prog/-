export type Category = 
  | 'Python' 
  | 'Arduino' 
  | 'AI-Model' 
  | 'Project' 
  | 'Other';

export interface Activity {
  id: string;
  title: string;
  description: string;
  category: Category;
  tags: string[];
  link?: string;
  addedAt: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
}

export interface Answer {
  id: string;
  author: string;
  content: string;
  addedAt: string;
}

export interface Question {
  id: string;
  author: string;
  title: string;
  content: string;
  password?: string;
  answers: Answer[];
  addedAt: string;
}

export interface ClubInfo {
  president: string;
  vicePresident: string;
  purpose: string;
  adminPassword?: string;
}

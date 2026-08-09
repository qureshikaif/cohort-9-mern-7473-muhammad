export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteList {
  items: Note[];
  total: number;
  page: number;
  limit: number;
}

export interface Session {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt: string;
  noteCount: number;
}

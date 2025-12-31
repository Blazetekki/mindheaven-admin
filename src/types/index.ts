// web-admin/src/types/index.ts
export interface Profile {
  fullName: string | null;
}

export interface Comment {
  id: string;
  content: string;
  author: Profile | null;
}

export interface Thread {
  id: string;
  title: string;
  createdAt: string;
  author: Profile | null;
  comments: Comment[];
}

export interface Forum {
  id: string;
  title: string;
  threads: Thread[];
}
// Add other types like Module, Lesson, etc. here
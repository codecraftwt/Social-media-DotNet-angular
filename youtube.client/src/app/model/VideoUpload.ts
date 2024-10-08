// src/app/models/video-upload.model.ts

export interface VideoUpload {
    id: number;
    url: string;
    thumbnail : string;
    likes: number;      // Ensure this exists
   dislikes: number;   // Ensure this exists
   views: number; 
   title : string;
  }
  
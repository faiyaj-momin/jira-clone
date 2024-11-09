import { Models } from 'node-appwrite';

export type Project = Models.Document & {
  name: string;
  imageUrl?: string;
  workspaceId: string;
};

// export interface Project extends Models.Document {
//   name: string;
//   imageUrl?: string;
//   workspaceId: string;
// }

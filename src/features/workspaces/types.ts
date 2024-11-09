import { Models } from 'node-appwrite';

export type Workspace = Models.Document & {
  name: string;
  imageUrl?: string | undefined;
  userId: string;
  inviteCode: string;
};

// Assuming Workspace is a type that extends Models.Document and includes the necessary properties
// export interface Workspace extends Models.Document {
//   name: string;
//   imageUrl?: string;
//   userId: string;
//   inviteCode: string;
// }

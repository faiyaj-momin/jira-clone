import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateInviteCode(length: number) {
  const characters =
    'AaB0bCcD1dEeF2fGg3HhI4iJjK5kLlM6mNnO7oPpQ8qRrSs9TtUu0VvWw5XxY7yZz';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

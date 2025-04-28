import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

// function convertToBoolean(value: unknown): boolean {
//   return value === '1' || (typeof value === 'string' && value.toLowerCase() === 'true') || value === true;
// }

/// Generates a random ID of 16 characters
export function generateId(): string {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE!) ?? 12582912;

/// Must be used in a server component
export const getAppUrl = () => {
  let appDomain = process.env.APP_DOMAIN ?? "localhost:3000";
  appDomain = appDomain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  const secure = process.env.APP_ENV === "development" ? "http" : "https";
  const appUrl = `${secure}://${appDomain}`;

  return { appDomain, appUrl };
};

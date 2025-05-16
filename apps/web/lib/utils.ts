import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/// Merges class names and removes duplicates
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/// Verifies if a string is a valid email address
export function verifyEmailInput(email: string): boolean {
  return /^.+@.+\..+$/.test(email) && email.length < 256;
}

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

/// Must be used in a server component
export const getAppUrl = () => {
  let appDomain = process.env.APP_DOMAIN || "localhost:3000";
  appDomain = appDomain.replace(/^(?:https?:\/\/)?(?:www\.)?/i, "");
  const secure = process.env.APP_ENV === "development" ? "http" : "https";
  const appUrl = `${secure}://${appDomain}`;

  return { appDomain, appUrl };
};

/// Verifies if a string is a valid URL
export function isValidUrl(url: string) {
  let givenURL;
  try {
    givenURL = new URL(url);
  } catch (error) {
    console.log("error is", error)
    return false;
  }
  return givenURL.protocol === "http:" || givenURL.protocol === "https:";
}
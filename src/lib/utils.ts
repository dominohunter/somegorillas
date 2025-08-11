import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { FlipHistory } from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats flip side from heads/tails to heads/butt terminology
 * @param side - Can be boolean (true = heads, false = tails) or string
 * @returns Formatted string "Heads" or "Butt"
 */
export const formatFlipSide = (side: string | boolean): string => {
  if (typeof side === "boolean") {
    return side ? "Heads" : "Butt";
  }

  // Handle string input
  const normalized = side.toLowerCase();
  if (normalized === "heads" || normalized === "head") {
    return "Heads";
  }
  if (
    normalized === "tails" ||
    normalized === "tail" ||
    normalized === "butt"
  ) {
    return "Butt";
  }

  // Fallback
  return side;
};

/**
 * Derives user's guess from flip result and win status
 * @param flip - Flip object with result (boolean) and isWin (boolean) fields
 * @returns boolean representing user's guess (true = heads, false = tails/butt)
 */
export const getGuessFromFlip = (flip: FlipHistory): boolean => {
  // Convert string result to boolean
  // Assuming "heads" or "true" = true, "tails"/"butt" or "false" = false
  const resultAsBoolean =
    flip.result === "heads" || flip.result === "true" || flip.result === "1";

  // If user won, their guess matches the result
  // If user lost, their guess is opposite of the result
  return flip.isWin ? resultAsBoolean : !resultAsBoolean;
};
/**
 * Formats flip result for display
 * @param userGuess - User's guess (boolean)
 * @param actualResult - Actual flip result (boolean)
 * @param isWin - Whether user won
 * @returns Formatted string like "Heads → Butt"
 */
export const formatFlipResult = (
  userGuess: boolean,
  actualResult: boolean,
  isWin: boolean,
): string => {
  const guessText = formatFlipSide(userGuess);
  const resultText = formatFlipSide(actualResult);
  const statusEmoji = isWin ? "✅" : "❌";

  return `${statusEmoji} ${guessText} → ${resultText}`;
};

/**
 * Convert heads/tails to boolean
 * @param side - "heads", "tails", "butt", or boolean
 * @returns boolean (true = heads, false = tails/butt)
 */
export const sideToBoolean = (side: string | boolean): boolean => {
  if (typeof side === "boolean") {
    return side;
  }

  const normalized = side.toLowerCase();
  return normalized === "heads" || normalized === "head";
};

/**
 * Convert boolean to side string
 * @param side - boolean value
 * @returns "heads" or "butt"
 */
export const booleanToSide = (side: boolean): string => {
  return side ? "heads" : "butt";
};

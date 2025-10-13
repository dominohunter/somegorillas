/**
 * Coinflip localization utility to replace "tails" with "butts"
 * for better user experience and branding
 */

export type CoinSide = "heads" | "tails";
export type LocalizedCoinSide = "heads" | "butts";

/**
 * Localizes coin flip terminology by replacing "tails" with "butts"
 */
export function localizeCoinSide(side: string): string {
  if (side.toLowerCase() === "tails" || side.toLowerCase() === "tail") {
    return "butts";
  }
  return side;
}

/**
 * Converts backend coin side to frontend display version
 */
export function displayCoinSide(side: CoinSide): LocalizedCoinSide {
  return side === "tails" ? "butts" : side;
}

/**
 * Converts frontend display version back to backend format
 */
export function backendCoinSide(side: LocalizedCoinSide | string): CoinSide {
  const normalized = side.toLowerCase();
  return normalized === "butts" || normalized === "butt" ? "tails" : "heads";
}

/**
 * Capitalizes the first letter of a coin side
 */
export function capitalizeCoinSide(side: string): string {
  return side.charAt(0).toUpperCase() + side.slice(1);
}
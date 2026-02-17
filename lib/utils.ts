/**
 * Generates initials from a name
 * - If name has 2+ words: first letter of first two words
 * - If name has 1 word: first two letters
 * Returns uppercase letters
 */
export function getInitials(name: string): string {
  if (!name) return "??";
  
  const words = name.trim().split(/\s+/);
  
  if (words.length >= 2) {
    // Two or more words: first letter of first two words
    return (words[0][0] + words[1][0]).toUpperCase();
  } else {
    // One word: first two letters
    const word = words[0];
    if (word.length >= 2) {
      return word.substring(0, 2).toUpperCase();
    } else {
      return word[0].toUpperCase();
    }
  }
}


/**
 * Calculates the Haversine distance between two points in kilometers.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(val: number): number {
  return (val * Math.PI) / 180;
}

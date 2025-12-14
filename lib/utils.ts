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

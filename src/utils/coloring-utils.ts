/**
 * Returns a Tailwind CSS class for a given nucleotide.
 * Updated for Bioluminescent Neon aesthetic.
 */
export function getNucleotideColorClass(nucleotide: string): string {
  switch (nucleotide.toUpperCase()) {
    case "A":
      // Neon Green + faint glow
      return "text-neon-A drop-shadow-[0_0_6px_rgba(57,255,20,0.5)]"; 
    case "T":
      // Neon Blue + faint glow
      return "text-neon-T drop-shadow-[0_0_6px_rgba(31,81,255,0.5)]";
    case "C":
      // Neon Orange + faint glow
      return "text-neon-C drop-shadow-[0_0_6px_rgba(255,145,0,0.5)]";
    case "G":
      // Neon Yellow + faint glow
      return "text-neon-G drop-shadow-[0_0_6px_rgba(255,255,0,0.5)]";
    default:
      return "text-muted-foreground"; // For 'N' or other
  }
}

/**
 * Formats a large number with commas.
 */
export function formatNumberWithCommas(value: number | string): string {
  const num = Number(value);
  if (isNaN(num)) {
    return String(value);
  }
  return num.toLocaleString();
}

/**
 * Returns classes for variant classification.
 * Updated for Glassmorphic Neon pills.
 */
export function getClassificationColorClasses(classification: string): string {
  if (!classification) {
     return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/20";
  }

  const lowercaseClass = classification.toLowerCase();

  if (lowercaseClass.includes("pathogenic")) {
    // Neon Magenta style
    return "bg-neon-magenta/10 text-neon-magenta border border-neon-magenta/30 shadow-glow-destructive";
  } else if (lowercaseClass.includes("benign")) {
    // Neon Cyan/Green style
    return "bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 shadow-[0_0_15px_-5px_hsl(165,100%,50%)]";
  } else {
     // Uncertain / Other - classic warning yellow
    return "bg-yellow-500/10 text-yellow-500 border border-yellow-500/30";
  }
}
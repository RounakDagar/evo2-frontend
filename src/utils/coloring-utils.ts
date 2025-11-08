/**
 * Returns a Tailwind CSS class for a given nucleotide.
 * These colors are chosen to be distinct and look good in dark mode.
 */
export function getNucleotideColorClass(nucleotide: string): string {
  switch (nucleotide.toUpperCase()) {
    case "A":
      return "text-green-400"; // Adenine
    case "T":
      return "text-blue-400"; // Thymine
    case "C":
      return "text-orange-400"; // Cytosine
    case "G":
      return "text-red-400"; // Guanine
    default:
      return "text-gray-500"; // For 'N' or other
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

export function getClassificationColorClasses(classification: string): string {
  if (!classification) {
    return "bg-yellow-100 text-yellow-800";
  }

  const lowercaseClass = classification.toLowerCase();

  if (lowercaseClass.includes("pathogenic")) {
    return "bg-red-100 text-red-800";
  } else if (lowercaseClass.includes("benign")) {
    return "bg-green-100 text-green-800";
  } else {
    return "bg-yellow-100 text-yellow-800";
  }
}

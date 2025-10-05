/**
 * Formats audio duration in seconds to hours:minutes format
 * @param seconds - Duration in seconds
 * @returns Formatted string in "Xh YYm" format or "Y Ym" if less than an hour
 */
export const formatAudioDuration = (
  seconds: number | null | undefined
): string => {
  if (!seconds || seconds <= 0) {
    return "0m";
  }

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  } else {
    return `${minutes}m`;
  }
};

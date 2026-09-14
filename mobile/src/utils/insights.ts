/**
 * Parse YYYY-MM-DD as a LOCAL calendar date.
 *
 * Do not use:
 *
 * new Date("2026-09-13")
 *
 * because JS treats that as UTC midnight,
 * which can become the previous day locally.
 */
export const parseLocalDate = (
  dateString: string
): Date => {
  const [year, month, day] =
    dateString
      .split("-")
      .map(Number);

  return new Date(
    year,
    month - 1,
    day
  );
};

/**
 * Date -> YYYY-MM-DD
 */
export const formatDateForApi = (
  date: Date
): string => {
  const year =
    date.getFullYear();

  const month = String(
    date.getMonth() + 1
  ).padStart(2, "0");

  const day = String(
    date.getDate()
  ).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

/**
 * Example:
 * Sep 13
 */
export const formatShortDate = (
  dateString: string
): string => {
  return parseLocalDate(
    dateString
  ).toLocaleDateString(
    "en-US",
    {
      month: "short",
      day: "numeric",
    }
  );
};

/**
 * Example:
 * Sun, Sep 13
 */
export const formatFullDate = (
  dateString: string
): string => {
  return parseLocalDate(
    dateString
  ).toLocaleDateString(
    "en-US",
    {
      weekday: "short",
      month: "short",
      day: "numeric",
    }
  );
};

/**
 * Returns null when comparison
 * cannot be calculated because
 * previous value is zero.
 */
export const calculatePercentageChange = (
  current: number,
  previous: number
): number | null => {
  if (previous === 0) {
    return null;
  }

  return (
    ((current - previous) /
      previous) *
    100
  );
};

export const getMonthName = (
  date: Date
): string => {
  return date.toLocaleDateString(
    "en-US",
    {
      month: "long",
    }
  );
};
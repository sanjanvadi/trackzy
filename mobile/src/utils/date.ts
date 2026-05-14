// Date Formatting Utilities

/**
 * Format date to display-friendly string
 * Examples:
 * - Today
 * - Yesterday
 * - Aug 10
 * - Dec 25, 2023
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  // Reset time for comparison
  const resetTime = (d: Date) => {
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const dateOnly = resetTime(new Date(date));
  const todayOnly = resetTime(new Date(today));
  const yesterdayOnly = resetTime(new Date(yesterday));

  if (dateOnly.getTime() === todayOnly.getTime()) {
    return 'Today';
  }

  if (dateOnly.getTime() === yesterdayOnly.getTime()) {
    return 'Yesterday';
  }

  // This year: "Aug 10"
  if (date.getFullYear() === today.getFullYear()) {
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  }

  // Different year: "Dec 25, 2023"
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

/**
 * Format date with time
 * Example: "Today, 8:30 AM"
 */
export const formatDateTime = (dateString: string): string => {
  const date = new Date(dateString);
  const dateStr = formatDate(dateString);

  const timeStr = date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  return `${dateStr}, ${timeStr}`;
};

/**
 * Format time only
 * Example: "8:30 AM"
 */
export const formatTime = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Get section title for grouped transactions
 * Examples:
 * - "TODAY"
 * - "YESTERDAY"
 * - "AUG 10"
 */
export const getSectionTitle = (dateString: string): string => {
  return formatDate(dateString).toUpperCase();
};

/**
 * Group expenses by date
 */
export const groupExpensesByDate = <T extends { date: string }>(
  expenses: T[]
): { title: string; data: T[] }[] => {
  const groups = new Map<string, T[]>();

  expenses.forEach((expense) => {
    const title = getSectionTitle(expense.date);
    if (!groups.has(title)) {
      groups.set(title, []);
    }
    groups.get(title)!.push(expense);
  });

  return Array.from(groups.entries()).map(([title, data]) => ({
    title,
    data,
  }));
};

/**
 * Convert date to YYYY-MM-DD format for API
 */
export const formatDateForAPI = (date: Date): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Get date range for period
 */
export const getDateRangeForPeriod = (
  period: 'today' | 'this_week' | 'this_month' | 'last_month' | 'all'
): { start_date: string; end_date: string } | null => {
  const today = new Date();
  const startOfDay = new Date(today);
  startOfDay.setHours(0, 0, 0, 0);

  switch (period) {
    case 'today':
      return {
        start_date: formatDateForAPI(startOfDay),
        end_date: formatDateForAPI(today),
      };

    case 'this_week': {
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
      return {
        start_date: formatDateForAPI(startOfWeek),
        end_date: formatDateForAPI(today),
      };
    }

    case 'this_month': {
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return {
        start_date: formatDateForAPI(startOfMonth),
        end_date: formatDateForAPI(today),
      };
    }

    case 'last_month': {
      const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
      return {
        start_date: formatDateForAPI(lastMonth),
        end_date: formatDateForAPI(endOfLastMonth),
      };
    }

    case 'all':
      return null; // No date filter
  }
};

/**
 * Check if date is today
 */
export const isToday = (dateString: string): boolean => {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

/**
 * Get relative time (e.g., "2 hours ago", "3 days ago")
 */
export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) {
    return 'Just now';
  }
  if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  }
  if (diffHours < 24) {
    return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
  }
  if (diffDays < 7) {
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  return formatDate(dateString);
};

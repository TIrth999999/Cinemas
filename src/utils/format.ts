/**
 * Formats a number as INR currency.
 * @param amount Number to format
 * @returns Formatted string (e.g. ₹1,200)
 */
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0
    }).format(amount);
};

/**
 * Formats a date string to a locale date string.
 * @param dateString Date string to format
 * @returns Formatted date string
 */
export const formatDate = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleDateString();
};

/**
 * Formats a date string to a locale time string (HH:MM).
 * @param dateString Date string to format
 * @returns Formatted time string
 */
export const formatTime = (dateString: string | Date): string => {
    return new Date(dateString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

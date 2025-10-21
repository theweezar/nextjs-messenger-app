/**
 * Get a background color class based on the first character of the name
 * @param {string} name - The name to derive the color from
 * @returns {string} - A Tailwind CSS background color class
 */
export const getAvatarColor = (name) => {
  if (!name || name.length === 0) return 'bg-gray-500';
  const colors = [
    'bg-blue-500',
    'bg-green-500',
    'bg-purple-500',
    'bg-pink-500',
    'bg-indigo-500',
    'bg-yellow-500',
    'bg-red-500',
    'bg-teal-500'
  ];
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Get initials from a username
 * @param {string} username - The username to extract initials from
 * @returns {string} - The initials in uppercase
 */
export const getInitials = (username) => {
  if (!username || username.length === 0) return '';
  return username
    .split(" ")
    .map((name) => name[0])
    .join("")
    .toUpperCase();
};
/**
 * Flatten an object into a string of key=value pairs
 * @param {Object} obj - The object to flatten 
 * @returns {string} Flattened string representation of the object
 */
export function flat(obj) {
  let result = '';
  if (obj) {
    if (typeof obj === 'object') {
      for (const [key, value] of Object.entries(obj)) {
        const _value = (typeof value === 'object') ? '[object Object]' : value;
        result += `${key}=${_value} `;
      }
    }
    if (typeof obj === 'string' || typeof obj === 'number' || typeof obj === 'boolean') {
      result += `value=${obj} `;
    }
  }
  return result.trim();
}
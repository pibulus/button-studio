// ===================================================================
// SIMPLE PIN ENCRYPTION - For API key sharing
// ===================================================================

/**
 * Simple XOR encryption with PIN
 * Good enough for API keys, simple to implement
 */
export function encryptWithPIN(text: string, pin: string): string {
  if (!text || !pin) return '';
  
  // Repeat PIN to match text length
  const repeatedPIN = pin.repeat(Math.ceil(text.length / pin.length));
  
  // XOR each character
  const encrypted = text.split('').map((char, i) => {
    const charCode = char.charCodeAt(0);
    const pinCode = repeatedPIN.charCodeAt(i);
    return String.fromCharCode(charCode ^ pinCode);
  }).join('');
  
  // Convert to base64 and make URL-safe
  const base64 = btoa(encrypted);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Decrypt with PIN
 */
export function decryptWithPIN(encrypted: string, pin: string): string {
  if (!encrypted || !pin) return '';
  
  try {
    // Convert from URL-safe base64
    const base64 = encrypted.replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '=='.substring(0, (4 - base64.length % 4) % 4);
    const text = atob(padded);
    
    // Repeat PIN to match text length
    const repeatedPIN = pin.repeat(Math.ceil(text.length / pin.length));
    
    // XOR each character (XOR is its own inverse)
    const decrypted = text.split('').map((char, i) => {
      const charCode = char.charCodeAt(0);
      const pinCode = repeatedPIN.charCodeAt(i);
      return String.fromCharCode(charCode ^ pinCode);
    }).join('');
    
    return decrypted;
  } catch {
    return ''; // Wrong PIN or corrupted
  }
}

/**
 * Validate PIN (4-6 digits)
 */
export function isValidPIN(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}

/**
 * Check if string looks like encrypted data
 */
export function isEncrypted(value: string): boolean {
  // Encrypted strings are base64-like and longer than typical API keys
  return value.length > 50 && /^[A-Za-z0-9_-]+$/.test(value);
}
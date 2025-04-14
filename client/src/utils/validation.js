export const validateProfile = (profile) => {
  const errors = [];

  // Validate first name
  if (!profile.firstName?.trim()) {
    errors.push('First name is required');
  }

  // Validate last name
  if (!profile.lastName?.trim()) {
    errors.push('Last name is required');
  }

  // Validate email format
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profile.email || '')) {
    errors.push('Invalid email address');
  }

  // Validate phone (optional)
  if (profile.phone && !/^\+?[\d\s-]{10,}$/.test(profile.phone)) {
    errors.push('Invalid phone number');
  }

  // Validate password (optional but strict if present)
  if (profile.password) {
    if (profile.password.length < 8) {
      errors.push('Password must be at least 8 characters');
    }
    if (!/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/.test(profile.password)) {
      errors.push('Password must contain both letters and numbers');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

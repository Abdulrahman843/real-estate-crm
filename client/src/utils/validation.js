export const validateProfile = (profile) => {
    const errors = [];
    
    if (!profile.email?.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      errors.push('Invalid email address');
    }
  
    if (profile.phone && !profile.phone.match(/^\+?[\d\s-]{10,}$/)) {
      errors.push('Invalid phone number');
    }
  
    if (!profile.firstName?.trim()) {
      errors.push('First name is required');
    }
  
    if (!profile.lastName?.trim()) {
      errors.push('Last name is required');
    }
  
    if (profile.password) {
      if (profile.password.length < 8) {
        errors.push('Password must be at least 8 characters');
      }
      if (!profile.password.match(/^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*#?&]{8,}$/)) {
        errors.push('Password must contain letters and numbers');
      }
    }
  
    return {
      isValid: errors.length === 0,
      errors
    };
  };
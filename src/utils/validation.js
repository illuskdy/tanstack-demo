const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validate = {
  name: (value) => {
    if (!value || value.trim().length < 2) return 'Name must be at least 2 characters';
    return null;
  },
  email: (value) => {
    if (!value || value.trim() === '') return null; // optional field
    if (!EMAIL_REGEX.test(value.trim())) return 'Invalid email format (e.g. user@example.com)';
    return null;
  },
};

export function validateUserForm({ name, email }) {
  return {
    name: validate.name(name),
    email: validate.email(email),
  };
}

export function hasErrors(errors) {
  return Object.values(errors).some(Boolean);
}

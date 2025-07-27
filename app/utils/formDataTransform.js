// Transform multipart form data to correct types for Zod validation
export const transformApplicationData = (formData) => {
  const transformed = { ...formData };

  // Convert string numbers to actual numbers
  if (transformed.age) {
    transformed.age = parseInt(transformed.age, 10);
  }

  if (transformed.gradYear) {
    transformed.gradYear = parseInt(transformed.gradYear, 10);
  }

  if (transformed.applicationYear) {
    transformed.applicationYear = parseInt(transformed.applicationYear, 10);
  }

  // Convert string boolean to actual boolean
  if (transformed.sleep !== undefined) {
    // Handle various boolean representations
    if (typeof transformed.sleep === 'string') {
      transformed.sleep = transformed.sleep.toLowerCase() === 'true' || transformed.sleep === '1';
    }
  }

  // Remove empty strings and convert to null/undefined where appropriate
  Object.keys(transformed).forEach(key => {
    if (transformed[key] === '') {
      // For optional fields, convert empty strings to undefined
      if (['github', 'linkedin', 'portfolio'].includes(key)) {
        delete transformed[key]; // Remove empty optional fields
      }
    }
  });

  return transformed;
}; 

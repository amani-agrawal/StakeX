// Safe ID getter utility to handle different ID field names
export const getId = (p: any): string => {
  return p?._id ?? p?.id ?? p?.productId ?? '';
};

// Validate if ID is a valid MongoDB ObjectId format
export const isValidObjectId = (id: string): boolean => {
  return /^[0-9a-fA-F]{24}$/.test(id);
};

// Pag-IBIG MID Number
// Allows numbers only and limits the value to 12 digits.
// Automatically formats the number into groups of 4 digits.
// Example: 123456789012 → 1234-5678-9012.
export const formatPagibigNo = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 12);

  return numbers.replace(/(\d{4})(?=\d)/g, "$1-");
};

// PhilHealth PIN
// Allows numbers only and limits the value to 12 digits.
// Automatically formats the number into 2-9-1 groups.
// Example: 071234567891 → 07-123456789-1.
export const formatPhilhealthNo = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 12);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 11) {
    return `${numbers.slice(0, 2)}-${numbers.slice(2)}`;
  }

  return `${numbers.slice(0, 2)}-${numbers.slice(2, 11)}-${numbers.slice(11)}`;
};

// TIN
// Allows numbers only and limits the value to 13 digits.
// Automatically formats the number into groups of 3 digits.
// Example: 123456789001 → 123-456-789-001.
export const formatTinNo = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 13);

  if (numbers.length <= 3) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  }

  if (numbers.length <= 9) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6)}`;
  }

  return `${numbers.slice(0, 3)}-${numbers.slice(3, 6)}-${numbers.slice(6, 9)}-${numbers.slice(9)}`;
};

// Mobile Phone Number
// Allows numbers only and limits the value to 11 digits.
// Automatically formats the number into 4-3-4 groups.
// Example: 09171234567 → 0917-123-4567.
export const formatPhoneNo = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 11);

  if (numbers.length <= 4) {
    return numbers;
  }

  if (numbers.length <= 7) {
    return `${numbers.slice(0, 4)}-${numbers.slice(4)}`;
  }

  return `${numbers.slice(0, 4)}-${numbers.slice(4, 7)}-${numbers.slice(7)}`;
};

// Telephone / Landline Number
// Allows numbers only and limits the value to 10 digits.
// Automatically formats the number with an area code.
// Example: 0281234567 → (02) 8123-4567.
export const formatTelephoneNo = (value: string) => {
  const numbers = value.replace(/\D/g, "").slice(0, 10);

  if (numbers.length <= 2) {
    return numbers;
  }

  if (numbers.length <= 6) {
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  }

  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 6)}-${numbers.slice(6)}`;
};
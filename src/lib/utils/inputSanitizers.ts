// Only Text
// Removes angle brackets and normalizes multiple spaces.
// Allows letters, numbers, and other characters by default.
export const sanitizeText = (value: string) => {
  return value
    .replace(/[<>]/g, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, 100);
};

// Only Letters & Common Name Characters
// Allows letters, spaces, periods, apostrophes, and hyphens.
// Maximum length: 50 characters.
export const sanitizeCity = (value: string) => {
  return value
    .replace(/[^a-zA-ZÀ-ÿ\s.'-]/g, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, 50);
};

// Letters, Numbers & Common Address Characters
// Allows letters, numbers, spaces, #, periods, commas, apostrophes,
// hyphens, and forward slashes.
//Maximum length: 100 characters.
export const sanitizeAddress = (value: string) => {
  return value
  .replace(/[^a-zA-Z0-9À-ÿ\s#.,'/-]/g, "")
  .slice(0, 100);

};

// Numbers Only
// Removes all non-numeric characters.
export const sanitizeNumbers = (value: string) => {
  return value.replace(/\D/g, "");
};

// Phone Numbers Only
// Allows numeric characters only.
// Formatting can be applied separately using a phone number formatter.
export const sanitizePhone = (value: string) => {
  return value.replace(/\D/g, "");
};

// Email Address
// Removes all whitespace characters from the email address.
export const sanitizeEmail = (value: string) => {
  return value.replace(/\s/g, "");
};

// ISO Code
// Allows letters, numbers, spaces, periods, colons, hyphens,
// forward slashes, and ampersands.
export const sanitizeISO = (value: string) => {
  return value
    .replace(/[^a-zA-Z0-9\s.:\-/&]/g, "")
    .replace(/\s+/g, " ")
    .trimStart();
};

// ZIP Code
// Allows numbers only and limits the value to 4 digits.
export const sanitizeZipCode = (value: string) => {
  return value.replace(/\D/g, "").slice(0, 4);
};

// Short Name
// Allows letters, numbers, spaces, periods, apostrophes,
// hyphens, and ampersands.
// Maximum length: 50 characters.
export const sanitizeShortName = (value: string) => {
  return value
    .replace(/[^a-zA-Z0-9\s.'\-&]/g, "")
    .replace(/\s+/g, " ")
    .trimStart()
    .slice(0, 50);
};


//Prevent invalid date input in the form. 
// Only allow YYYY-MM-DD format. 
//Prevent Effective Until to access a date earlier than Effectivity Date. 
export const sanitizeDate = (value: string) => {
  // Only allow YYYY-MM-DD format
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return "";
  }

  return value;
};

export const sanitizeDecimal = (value: string) => {
  const sanitized = value
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1");

  const [whole, decimal] = sanitized.split(".");

  if (whole.length > 3) {
    return whole.slice(0, 3) + (decimal !== undefined ? `.${decimal}` : "");
  }

  return sanitized;
};

export const sanitizePercentage = (value: string) => {
  const sanitized = sanitizeDecimal(value);
  return sanitized && Number(sanitized) > 100 ? "100" : sanitized;
};

export const sanitizeAmount = (value: string) => {
  const sanitized = value
    .replace(/,/g, "")
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1");

  const [whole, decimal] = sanitized.split(".");
  return whole + (decimal !== undefined ? `.${decimal.slice(0, 2)}` : "");
};


export const sanitizeHours = (value: string) => {
  return value
    .replace(/[^\d.]/g, "")
    .replace(/(\..*)\./g, "$1");
};
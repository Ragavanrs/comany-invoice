/**
 * PDF Generation Constants
 * Shared styling constants for Invoice and Delivery Challan PDFs
 */

/**
 * Color scheme for PDF documents
 */
export const PDF_COLORS = {
  primary: [0, 0, 139],        // Dark blue for headers and titles
  secondary: [128, 128, 128],  // Gray for secondary text
  text: [0, 0, 0],             // Black for main content
  white: [255, 255, 255],      // White for backgrounds
  lightGray: [240, 240, 240],  // Light gray for table backgrounds
};

/**
 * Font sizes for different text elements
 */
export const PDF_FONTS = {
  title: 18,        // Document title (e.g., "TAX INVOICE")
  header: 16,       // Main headers (e.g., company name)
  subheader: 14,    // Section subheaders
  body: 10,         // Regular body text
  small: 9,         // Small text
  tiny: 8,          // Footer text
};

/**
 * Margins and spacing
 */
export const PDF_MARGINS = {
  page: 12,         // Standard page margin
  pageLarge: 20,    // Larger page margin for some documents
  section: 8,       // Space between sections
  row: 5,           // Space between rows
  headerTop: 42,    // Top margin to accommodate header
  footerBottom: 18, // Bottom margin to accommodate footer
};

/**
 * A4 page dimensions in millimeters
 */
export const PDF_PAGE_SIZE = {
  width: 210,   // A4 width in mm
  height: 297,  // A4 height in mm
};

/**
 * Default company information
 * Can be overridden by passing company parameter to PDF generators
 */
export const DEFAULT_COMPANY_INFO = {
  name: "SURYA POWER",
  tagline: "DG Set Hiring, Old DG Set Buying, Selling & Servicing",
  address: "No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052",
  gstin: "33AKNPR3914K1ZT",
  contacts: "Mob: 9790987190 / 9840841887",
  bankTitle: "TAMILNAD MERCANTILE BANK",
  bankName: "SURYA POWER",
  accountNo: "22815005800163",
  branch: "NARAVARIKUPPAM BRANCH",
  ifsc: "TMBL0000228",
};

/**
 * Logo dimensions
 */
export const LOGO_DIMENSIONS = {
  width: 30,
  height: 18,
};

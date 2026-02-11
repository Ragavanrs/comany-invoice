# Document Management System

A modern, comprehensive document management system for creating, managing, and exporting professional business documents including Tax Invoices, Business Letters, and Delivery Challans.

![Dashboard](https://github.com/user-attachments/assets/41e189d7-b99a-48f0-a6b4-dee2ffdac2ac)

## Features

### 🏠 Dashboard
- Modern, intuitive interface with sidebar navigation
- Quick access to all document modules
- Overview cards for each document type
- Responsive design for all devices

### 📄 Invoice Generator
- Create GST-compliant tax invoices
- Support for both CGST+SGST (Intra-state) and IGST (Inter-state)
- Dynamic item rows with automatic calculations
- Save invoices for later editing
- Generate professional PDF exports
- View and manage all saved invoices

![Invoice Generator](https://github.com/user-attachments/assets/e19485d8-8ef2-412c-8f6d-3872206d9ce7)

### ✉️ Letter Pad Generator
- Professional business letter creation
- Multiple templates (Formal, Semi-formal)
- Live preview panel
- Company letterhead with logo
- Customizable sender signature
- Save and manage letters
- PDF export with proper formatting

![Letter Pad](https://github.com/user-attachments/assets/ff70aa32-86ea-46a1-9f9e-042e26d6499e)

### 🚚 Delivery Challan
- Create delivery challans for goods transportation
- Item management with quantity, unit, and remarks
- Transport details (vehicle number, driver name)
- Terms and conditions section
- Save and manage challans
- Professional PDF generation

![Delivery Challan](https://github.com/user-attachments/assets/feaf04b0-ac40-487d-a6f2-12780ddb15fb)

### 🎨 Theme Support
- Light and Dark mode
- Smooth theme transitions
- Theme preference saved to localStorage
- Easy toggle from header

![Dark Mode](https://github.com/user-attachments/assets/d049db53-11b3-40f6-9dd0-adc8e19996dd)

## Technology Stack

- **Frontend Framework:** React 18.2.0
- **Routing:** React Router DOM 6.20.0
- **Styling:** Bootstrap 5.3.0
- **Icons:** Bootstrap Icons
- **PDF Generation:** jsPDF 2.5.2 with jspdf-autotable 3.8.4
- **Storage:** LocalStorage for data persistence

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/Ragavanrs/comany-invoice.git
cd comany-invoice
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:3000
```

### Build for Production

```bash
npm run build
```

This creates an optimized production build in the `build` folder.

## Usage Guide

### Creating an Invoice

1. Navigate to the Invoice Generator from the sidebar or dashboard
2. Fill in the invoice details:
   - Invoice number and date
   - Customer information (name, address, GSTIN)
   - PO and DC numbers (optional)
3. Add items:
   - Click "Add Item" to add more rows
   - Enter description, HSN code, rate, quantity, and GST percentage
   - Amount is calculated automatically
4. Select tax type (CGST+SGST or IGST)
5. Click "Save Invoice" to save for later or "Generate PDF" to download

### Creating a Letter

1. Navigate to Letter Pad from the sidebar
2. Fill in letter details:
   - Reference number and date
   - Choose template (Formal or Semi-formal)
3. Enter recipient details
4. Write the letter content:
   - Subject
   - Body text
5. Add sender signature (optional)
6. Preview updates in real-time on the right panel
7. Save or generate PDF

### Creating a Delivery Challan

1. Navigate to Delivery Challan from the sidebar
2. Fill in challan details:
   - Challan number and date
   - Supplier information
   - Recipient information
3. Add items with quantity, unit, and remarks
4. Enter transport details
5. Add terms and conditions (optional)
6. Save or generate PDF

### Managing Documents

- Click "View Saved [Documents]" button to see all saved documents
- Edit: Click the edit icon to load a document into the form
- Delete: Click the trash icon (confirmation required)
- Download: Click the download icon to generate PDF

### Theme Toggle

- Click the theme toggle button (moon/sun icon) in the header
- Theme preference is automatically saved
- Works across all pages

## Project Structure

```
src/
├── components/
│   ├── common/
│   │   ├── Sidebar.js          # Navigation sidebar
│   │   ├── Header.js           # Top header with theme toggle
│   │   ├── ThemeToggle.js      # Theme toggle component
│   │   ├── DocumentList.js     # Reusable document list
│   │   └── DashboardHome.js    # Dashboard landing page
│   ├── invoice/
│   │   ├── InvoiceForm.js      # Invoice form component
│   │   ├── InvoiceList.js      # List of saved invoices
│   │   └── InvoiceModule.js    # Invoice module container
│   ├── letterpad/
│   │   ├── LetterPadForm.js    # Letter pad form
│   │   ├── LetterPadList.js    # List of saved letters
│   │   └── LetterPadModule.js  # Letter pad module container
│   └── challan/
│       ├── ChallanForm.js      # Challan form component
│       ├── ChallanList.js      # List of saved challans
│       └── ChallanModule.js    # Challan module container
├── utils/
│   ├── pdfGenerators/
│   │   ├── invoicePDF.js       # Invoice PDF generator
│   │   ├── letterPadPDF.js     # Letter PDF generator
│   │   └── challanPDF.js       # Challan PDF generator
│   ├── storage.js              # LocalStorage utilities
│   └── validation.js           # Validation utilities
├── styles/
│   ├── variables.css           # Theme CSS variables
│   ├── sidebar.css             # Sidebar styles
│   ├── header.css              # Header styles
│   ├── dashboard.css           # Dashboard styles
│   └── modules.css             # Module-specific styles
├── App.js                      # Main app with routing
├── Dashboard.js                # Dashboard layout
└── index.js                    # App entry point
```

## Features in Detail

### LocalStorage Integration
- All documents are saved locally in your browser
- Data persists across sessions
- No server or database required
- Easy to import/export data

### PDF Generation
- Professional PDF layouts
- Company logo and branding
- Proper formatting for printing
- GST-compliant invoice format
- Indian numbering system for amounts

### Responsive Design
- **Desktop (>992px):** Full sidebar, multi-column forms
- **Tablet (768-991px):** Collapsible sidebar, two-column forms
- **Mobile (<768px):** Hidden sidebar with toggle, single-column forms
- Touch-friendly buttons and inputs

### Form Validation
- Required field indicators
- Real-time validation
- Error messages
- Success feedback

## Company Information

The application is pre-configured for:
- **Company Name:** SURYA POWER
- **Tagline:** DG Set Hiring, Old DG Set Buying, Selling & Servicing
- **Address:** No.1/11, G.N.T Road, Padiyanallur Redhills, Chennai, Thiruvallur, Tamil Nadu - 600 052
- **GSTIN:** 33AKNPR3914K1ZT
- **Contact:** Mob: 9790987190 / 9840841887
- **Bank:** TAMILNAD MERCANTILE BANK

To customize, edit the company details in:
- `src/components/invoice/InvoiceModule.js`
- `src/components/letterpad/LetterPadModule.js`
- `src/components/challan/ChallanModule.js`

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Opera

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is open source and available under the MIT License.

## Support

For support, please open an issue in the GitHub repository.

## Acknowledgments

- React team for the amazing framework
- Bootstrap team for the UI components
- jsPDF team for PDF generation capabilities

---

**Version:** 2.0.0  
**Last Updated:** February 2026

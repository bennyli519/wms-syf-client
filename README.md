# Admin Portal - Inventory Management System

A modern admin portal built with **Ant Design Pro** and **React** for managing fabric inventory.

## Features

### 📋 Menu Structure
- **Inventory Management** (Primary Menu)
  - **Fabric Entry** - Add new fabric records to inventory
  - **Fabric Order Generation** - Create and manage fabric orders
  - **Inventory List** - View and manage existing inventory

### 🚀 Key Functionalities

#### Fabric Entry
- Add new fabric records with detailed information
- Form validation for required fields
- Support for various fabric types (Cotton, Polyester, Silk, Wool, Linen)
- Price calculation and batch tracking

#### Fabric Order Generation
- Create fabric orders with multiple items
- Set order priorities and delivery dates
- Dynamic item addition and removal
- Order summary with totals

#### Inventory List
- Comprehensive inventory overview with statistics
- Advanced search and filtering capabilities
- Status tracking (In Stock, Low Stock, Out of Stock)
- Export functionality
- Interactive data table with pagination

## 🛠️ Technology Stack

- **React 18** - Frontend framework
- **TypeScript** - Type safety
- **Ant Design 5** - UI component library
- **Ant Design Pro Components** - Advanced components
- **React Router DOM** - Navigation
- **Vite** - Build tool and dev server

## 📦 Installation & Setup

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation Steps

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start Development Server**
   ```bash
   npm run dev
   ```
   or
   ```bash
   npm start
   ```

3. **Open Browser**
   Navigate to `http://localhost:3000`

### Available Scripts

- `npm run dev` / `npm start` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## 📁 Project Structure

```
admin-portal/
├── src/
│   ├── pages/
│   │   └── inventory/
│   │       ├── FabricEntry.tsx
│   │       ├── FabricOrderGeneration.tsx
│   │       └── InventoryList.tsx
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
├── tsconfig.json
└── README.md
```

## 🎨 UI Features

- **Responsive Design** - Works on desktop and mobile devices
- **Pro Layout** - Professional sidebar navigation with breadcrumbs
- **Modern Components** - Cards, tables, forms with validation
- **Statistics Dashboard** - Real-time inventory statistics
- **Interactive Tables** - Sorting, filtering, and pagination
- **Form Validation** - Client-side validation with error messages

## 🔧 Customization

### Adding New Menu Items
Edit the `menuDataRender` function in `src/App.tsx` to add new menu items.

### Styling
- Global styles: `src/index.css`
- Component-specific styles: Inline styles or styled-components

### Data Integration
Replace mock data in components with API calls to your backend service.

## 📝 Notes

- This is a frontend-only template with mock data
- All form submissions currently log to console
- Ready for backend integration
- Fully responsive and accessible design

## 🤝 Contributing

1. Fork the project
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License

This project is open source and available under the [MIT License](LICENSE).  11
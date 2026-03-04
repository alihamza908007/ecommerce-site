# E-Commerce Store

This is a Next.js e-commerce application with user authentication, shopping cart functionality, and an admin dashboard.

## Features

### User Features
- User login and signup functionality
- Browse products with images, descriptions, and prices
- Add products to shopping cart
- Edit cart items (update quantities or remove items)
- Proceed to checkout

### Admin Features
- Admin dashboard with key metrics
- View stock levels and identify low stock items
- View order history with status tracking
- Manage products and inventory

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── auth/           # Authentication pages (login/signup)
│   ├── products/       # Product listing and browsing
│   ├── cart/           # Shopping cart functionality
│   ├── admin/          # Admin dashboard
│   ├── api/            # API routes
│   └── layout.tsx      # Root layout with CartProvider
├── context/            # React context for cart state management
├── lib/                # Utility functions and data
├── types/              # TypeScript type definitions
└── ...
```

## Key Components

1. **Authentication System**
   - Login (`/auth/login`)
   - Signup (`/auth/signup`)

2. **Product Management**
   - Product listings (`/products`)
   - Product data simulated in `src/lib/products.ts`

3. **Shopping Cart**
   - Cart context in `src/context/cart-context.tsx`
   - Cart page (`/cart`)

4. **Admin Dashboard**
   - Dashboard with metrics (`/admin/dashboard`)
   - Order history and stock management

## Data Management

This demo uses static data for products, orders, and stock levels. In a production environment, this would be replaced with database queries and API endpoints.

## Available Scripts

- `npm run dev` - Runs the app in development mode
- `npm run build` - Builds the app for production
- `npm run start` - Runs the built app in production mode
- `npm run lint` - Runs the linter

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- React Context API - State management

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.
# Plushoff Store Lite

A lightweight e-commerce platform built with modern technologies.

## Tech Stack

- **Frontend:**
  - Next.js 14 (App Router)
  - TypeScript
  - Tailwind CSS
  - Zustand (State Management)

- **Backend:**
  - Next.js API Routes
  - Prisma ORM
  - SQLite Database
  - NextAuth.js v5

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/plushoff-store-lite.git
cd plushoff-store-lite
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## Features

- Static Site Generation for better performance
- Dynamic product pages with client-side rendering
- User authentication and authorization
- Shopping cart functionality
- Order management
- Admin dashboard
- Responsive design

## Project Structure

```
src/
├── app/              # Next.js App Router pages
├── components/       # Reusable UI components
├── lib/             # Utility functions and configurations
├── store/           # Zustand store configurations
└── types/           # TypeScript type definitions
```

## Database Schema

The application uses SQLite with Prisma ORM and includes the following models:
- User
- Product
- Category
- Order
- OrderItem

## License

MIT

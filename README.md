# Veloura

A full-stack e-commerce application for selling jewelry (chains, rings, and bracelets) with user authentication, shopping cart, wishlist, and owner management features.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Project Structure](#project-structure)
- [Usage](#usage)
- [API Routes](#api-routes)
- [Scripts](#scripts)

## Overview

Veloura is an Express.js-based e-commerce platform that allows:
- **Users** to browse products, manage shopping carts, and maintain wishlists
- **Owners** to create and manage products
- Secure authentication with JWT tokens
- Email notifications via Nodemailer
- File uploads via Multer
- MongoDB database integration

## Features

 **User Features**
- User registration and login with secure password encryption (bcrypt)
- Browse jewelry products (chains, rings, bracelets)
- Add/remove items from shopping cart with quantity management
- Create and manage wishlists
- View user profile and order history
- Email notifications

 **Owner Features**
- Owner registration and authentication
- Create, update, and delete products
- Manage product inventory and pricing
- Set product discounts
- Access owner dashboard
- View and manage products

 **General Features**
- JWT-based authentication with secure session management
- Flash messages for user feedback
- Responsive EJS templating
- Static file serving
- CORS and CSRF protection via cookies
- Multer for image uploads
- Email service for notifications

## Tech Stack

**Backend:**
- Node.js
- Express.js (v5.1.0)
- MongoDB with Mongoose (v8.16.5)

**Frontend:**
- EJS templating engine
- Bootstrap/CSS for styling

**Authentication & Security:**
- bcrypt (v6.0.0) - Password hashing
- jsonwebtoken (v9.0.2) - JWT tokens
- express-session (v1.18.2) - Session management
- cookie-parser (v1.4.7) - Cookie handling


## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd veloura
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Create a `.env` file** in the root directory with the required environment variables

4. **Connect to MongoDB**
   - Ensure MongoDB is running locally or provide a remote connection string



## Usage

### Development Mode
```bash
npm run dev
```
Runs with Nodemon for automatic restart on file changes.

### Production Mode
```bash
npm start
```
Starts the application on port 3000.

- `POST /send` - Send email notification

## Future Enhancements

- Payment gateway integration (Stripe, Razorpay)
- [ ] Email verification
- [ ] Two-factor authentication





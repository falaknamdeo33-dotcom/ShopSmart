# ShopSmart — Full-Stack E-Commerce Application

ShopSmart is a full-stack e-commerce web application built using React, Node.js, Express.js, MongoDB, and Redis.

## Features

* User registration and login
* JWT-based authentication
* Password hashing using bcrypt
* Product listing with images
* Product search and category filtering
* Shopping cart functionality
* Order placement and order history
* Automatic stock updates after orders
* Admin product management: add, edit, and delete products
* Redis caching for faster product loading
* Responsive user interface

## Technology Stack

**Frontend:** React, Vite, CSS, Axios

**Backend:** Node.js, Express.js

**Database:** MongoDB, Mongoose

**Caching:** Redis

**Authentication:** JWT and bcryptjs

## Project Structure

```text
ShopSmart/
├── backend/
│   ├── public/
│   ├── server.js
│   ├── db.js
│   ├── redis.js
│   ├── product.js
│   ├── order.js
│   ├── user.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
├── .gitignore
└── README.md
```

## How to Run Locally

### 1. Start the backend

Open a terminal in the project folder and run:

```bash
cd backend
npm install
node server.js
```

### 2. Start the frontend

Open a second terminal in the project folder and run:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your browser.

**Prerequisites:** Node.js, MongoDB, and a running Redis-compatible service must be configured. Set required environment variables in `backend/.env` according to your backend configuration. Never upload `.env` or other secrets to GitHub.

## Redis Caching

ShopSmart caches product data in Redis to reduce repeated database queries. When products change, the cache is invalidated so subsequent requests can retrieve updated data.

## Project Goal

This project demonstrates practical full-stack development, REST API creation, authentication, database integration, caching, and e-commerce order workflows.

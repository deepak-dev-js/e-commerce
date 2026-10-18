# MERN E-Commerce Project — Deployment Checklist

## 1. Deployment Platforms

* [ ] **Frontend — Vercel**

  * Host the React + Vite application.
  * Automatically deploy frontend changes from GitHub.
  * Website: https://vercel.com/

* [ ] **Backend — Render**

  * Host the Node.js + Express server.
  * Deploy REST APIs for authentication, products, cart, and orders.
  * Website: https://render.com/

* [ ] **Database — MongoDB Atlas**

  * Store users, products, carts, and orders.
  * Start with the M0 Free cluster.
  * Website: https://www.mongodb.com/products/platform/atlas-database

* [ ] **Source Code — GitHub**

  * Store frontend and backend code.
  * Track changes using Git.
  * Connect GitHub to Vercel and Render for automatic deployments.
  * Website: https://github.com/

## 2. Optional Services

* [ ] **Image Storage — Cloudinary**

  * Store product images and other uploaded media.
  * Website: https://cloudinary.com/

* [ ] **Payment Gateway — Razorpay**

  * Integrate payments for Indian customers.
  * Use test mode during development.
  * Website: https://razorpay.com/

* [ ] **Email Service — Brevo**

  * Send verification emails, order confirmations, and password reset emails.
  * Website: https://www.brevo.com/

* [ ] **API Testing — Postman**

  * Test backend APIs before connecting them to the frontend.
  * Website: https://www.postman.com/

## 3. Deployment Order

1. [ ] Create a GitHub repository.
2. [ ] Deploy the React frontend to Vercel.
3. [ ] Create a MongoDB Atlas database.
4. [ ] Deploy the Express backend to Render.
5. [ ] Configure environment variables on Vercel and Render.
6. [ ] Connect the frontend to the deployed backend.
7. [ ] Test the complete application using the public URL.
8. [ ] Deploy new features incrementally.
9. [ ] Verify each feature after deployment.

## 4. Important Environment Variables

### Frontend — Vercel

* [ ] `VITE_API_URL` — deployed backend API URL.

### Backend — Render

* [ ] `PORT` — use the port provided by the hosting environment.
* [ ] `MONGODB_URI` — MongoDB Atlas connection string.
* [ ] `JWT_SECRET` — secret key for JWT authentication, if used.
* [ ] `CLIENT_URL` — deployed frontend URL for CORS configuration.
* [ ] Payment and email credentials, if those features are implemented.

**Security:** Never commit `.env` files, database credentials, JWT secrets, or payment secrets to GitHub.

## 5. Final Testing Checklist

* [ ] Homepage loads correctly.
* [ ] Product listing and product details work.
* [ ] User registration and login work.
* [ ] Cart operations work.
* [ ] Checkout and order creation work.
* [ ] Product images load correctly.
* [ ] Payment works in test mode.
* [ ] Website works on mobile and desktop.
* [ ] Backend and database remain accessible.

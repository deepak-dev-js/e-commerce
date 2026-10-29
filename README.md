# MERN ApnaShop Project — Deployment Checklist

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




# ApnaShop – Android APK Build & Update

This guide explains how to build a new APK for ApnaShop and update the existing app installed on your Android phone.

## 1. Open the Native Project

Open the terminal in VS Code and navigate to the native project directory:

```bash
cd C:\Projects\apnashop\native
```

## 2. Make Code Changes

Update the required files in your React Native project.

For example:

* Update the home screen UI.
* Add new screens or components.
* Modify styles or functionality.
* Fix bugs.

Save your changes before starting the build.

## 3. Build a New APK

Run the following command:

```bash
npx eas-cli@latest build --platform android --profile preview
```

EAS Build will upload your project and build the APK on Expo's cloud servers.

Wait for the build to finish successfully.

## 4. Download the APK

After the build completes:

1. Open the build link displayed in the terminal.
2. Confirm that the build status is `Finished`.
3. Download the APK file to your computer.

## 5. Update the Existing App

Transfer the downloaded APK to your Android phone if necessary.

1. Open the APK file on your phone.
2. Allow installation from that source if Android requests permission.
3. Tap **Install** or **Update**.
4. Wait for installation to finish.
5. Open ApnaShop and verify the changes.

Usually, you do not need to uninstall the existing app first.

## 6. Important Requirements

To update the existing installation successfully:

* Keep the Android application ID unchanged: `com.apnashopsteam.apnashop`.
* Preserve the Android signing credentials used for the previous build.
* Keep the package configuration consistent.
* Ensure the new build completes successfully before installing it.

**Warning:** Uninstalling the existing app may delete its locally stored data. Avoid uninstalling it unless necessary.

## 7. Build Command for Future Updates

Whenever you want to install a new version of ApnaShop, repeat this command:

```bash
npx eas-cli@latest build --platform android --profile preview
```

Download the new APK and install it on your phone.

## 8. Important Note About GitHub

Pushing code to GitHub does not automatically update the installed APK.

A new APK build and installation are required to distribute changes using this workflow.

For supported JavaScript and UI updates without reinstalling an APK, Expo Updates can be configured separately.

---

**Project:** ApnaShop
**Framework:** React Native with Expo
**Build Service:** EAS Build
**Platform:** Android
**Build Profile:** Preview
**Output:** APK

Your ApnaShop web app and React Native app use different authentication approaches
  Web (React): HTTP-only cookie.
  Native (React Native / Expo): JWT token.

Feature	What Socket.IO will do	Difficulty
  1. Real-time order notifications	Notify the admin when a customer places an order	Easy
  2. Order status updates	Notify customers when their order is shipped or delivered	Easy–Medium
  3. Real-time chat	Allow customers to chat with support or the admin	Medium
  4. Online status	Show whether a user is online	Medium
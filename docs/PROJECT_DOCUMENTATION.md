## Pickify-new — Detailed Project Documentation

This document explains the repository structure, responsibilities of major files and folders, API endpoints, models, controllers, frontend hooks, Redux usage, run/deploy instructions, and where to find critical logic.

Summary: Pickify-new is a marketplace/grocery app with
- Backend: Node.js + Express + Mongoose (MongoDB), Socket.IO for real-time updates.
- Frontend: React + Vite, React Router, Redux Toolkit, custom hooks.
- Roles: `user`, `owner`, `deliveryBoy`, `admin`.

----

## Quick start (development)

Backend (from the `backend` folder):
- Install dependencies: `npm install` (run inside `backend/`).
- Run dev server: `node index.js` or `npm start` (check `backend/package.json` for exact script).
- Required env: create `backend/.env` with at minimum `MONGODB_URL`. Optional: Cloudinary, Razorpay, JWT secrets.

Frontend (from the `frontend` folder):
- Install: `npm install`.
- Run dev server: `npm run dev`.
- Set backend URL: `VITE_SERVER_URL` in `frontend/.env` if needed. Defaults to `http://localhost:8000`.

To produce a PDF locally from this Markdown (example using pandoc):

```powershell
pandoc docs/PROJECT_DOCUMENTATION.md -o docs/PROJECT_DOCUMENTATION.pdf
```

If `pandoc` is not available, I can convert using a Node script or generate a simple HTML and print to PDF locally.

----

## Repository layout (top-level)

- `backend/` — Express server, controllers, models, routes, utilities.
- `frontend/` — React single-page-app (Vite), components, pages, hooks, Redux store.
- `docs/PROJECT_DOCUMENTATION.md` — this file.

----

## Backend: detailed structure and responsibilities

- Entry: [backend/index.js](backend/index.js)
  - Creates Express app and HTTP server, configures CORS and cookies, mounts route modules, initializes Socket.IO, and starts the server. It stores the `io` instance on `app` (`app.set('io', io)`) so controllers can emit events.

- DB connection: [backend/config/db.js](backend/config/db.js)
  - Connects to MongoDB using `process.env.MONGODB_URL`.

- Real-time: [backend/socket.js](backend/socket.js)
  - Handles Socket.IO connections:
    - `identity`: associates a `userId` with `socket.id` and marks the user online.
    - `updateLocation`: updates `User.location` (GeoJSON Point) and emits `updateDeliveryLocation` to all clients.
    - `disconnect`: clears `socketId` and marks user offline.

- Utilities (`backend/utils`):
  - `token.js` — token creation and verification helpers used by auth flows.
  - `mail.js` — email helpers; used for OTP and delivery OTP emails.
  - `cloudinary.js` — uploads images and returns hosted URL.

### Routes and endpoints (summary table)

Below are the main mounted routes (see each router file in `backend/routes/` for exact endpoints):

- `/api/auth` — authentication
  - `POST /signup` — create user (sets `token` cookie)
  - `POST /signin` — login (sets `token` cookie)
  - `GET /signout` — clear cookie
  - `POST /send-otp` — send password reset OTP
  - `POST /verify-otp` — verify OTP
  - `POST /reset-password` — reset password after OTP
  - `POST /google-auth` — sign-in/up via Google payload

- `/api/user` — user endpoints
  - `GET /current` — returns current user (middleware `isAuth`)
  - `POST /update-location` — updates user location (used by geolocation hook)

- `/api/cart` — cart endpoints
  - `GET /my` — get the logged-in user's cart
  - `POST /sync` — sync client cart to server
  - `POST /clear` — clear cart

- `/api/category` — categories
  - `GET /` — list categories (inserts defaults if empty)
  - `POST /` — create category (admin only)
  - `PUT /:categoryId` — update category (admin)
  - `DELETE /:categoryId` — delete category (admin)

- `/api/shop` — shop management
  - `POST /create-edit` — owner creates or updates their shop (file upload supported)
  - `GET /get-my` — get shop owned by the current user
  - `GET /get-by-city/:city` — list shops by city (pagination)

- `/api/item` — item management
  - `POST /add-item` — owner adds item (upload image)
  - `POST /edit-item/:itemId` — edit item (upload image)
  - `GET /get-by-id/:itemId` — get item details
  - `GET /delete/:itemId` — delete item
  - `GET /get-by-city/:city` — items across shops in a city (pagination)
  - `GET /get-by-shop/:shopId` — items for a shop
  - `GET /search-items` — search items by query & city
  - `POST /rating` — submit rating for an item

- `/api/order` — ordering & delivery
  - `POST /place-order` — create order (supports online payments via Razorpay)
  - `POST /verify-payment` — verify payment signature & mark order paid
  - `GET /my-orders` — get orders depending on user role (buyer/owner)
  - `GET /get-assignments` — delivery boys see available assignments
  - `GET /get-current-order` — get currently assigned order for delivery
  - `POST /send-delivery-otp` — generate and email OTP to customer
  - `POST /verify-delivery-otp` — verify OTP and mark delivered
  - `POST /update-status/:orderId/:shopId` — update per-shop status (owner action)
  - `GET /accept-order/:assignmentId` — delivery boy accepts assignment
  - `GET /get-order-by-id/:orderId` — detailed order
  - `GET /invoice/:orderId` — get printable invoice data
  - `GET /get-today-deliveries` — delivery stats for today

Refer to the router files in `backend/routes/` for the exact parameter names and middleware used (auth/admin checks, file uploads).

### Important backend controllers (what each exports)

- `backend/controllers/auth.controllers.js`:
  - `signUp`, `signIn`, `signOut`, `sendOtp`, `verifyOtp`, `resetPassword`, `googleAuth`.

- `backend/controllers/user.controllers.js`:
  - `getCurrentUser`, `updateUserLocation`.

- `backend/controllers/cart.controllers.js`:
  - `getMyCart`, `syncCart`, `clearCart`. Sync normalizes item payload, persists `Cart` document and calculates totals.

- `backend/controllers/category.controllers.js`:
  - `getCategories`, `createCategory`, `updateCategory`, `deleteCategory`. Inserts defaults if DB empty.

- `backend/controllers/shop.controllers.js`:
  - `createEditShop`, `getMyShop`, `getShopByCity`. Handles file upload via Cloudinary and populates owner/items.

- `backend/controllers/item.controllers.js`:
  - `addItem`, `editItem`, `getItemById`, `deleteItem`, `getItemByCity`, `getItemsByShop`, `searchItems`, `rating`.

- `backend/controllers/order.controllers.js`:
  - `placeOrder`, `verifyPayment`, `getMyOrders`, `updateOrderStatus`, `getDeliveryBoyAssignment`, `acceptOrder`, `getCurrentOrder`, `getOrderById`, `getInvoiceByOrderId`, `sendDeliveryOtp`, `verifyDeliveryOtp`, `getTodayDeliveries`.
  - Contains Razorpay integration and delivery assignment logic (find nearby delivery boys, create DeliveryAssignment documents, emit Socket events).

### Models (fields & special behavior)

- `backend/models/user.model.js`:
  - `fullName`, `email` (unique), `password`, `mobile`, `role` (enum: `user|owner|deliveryBoy|admin`), `resetOtp`, `isOtpVerified`, `otpExpires`, `socketId`, `isOnline`, `location` (GeoJSON `Point` with `coordinates: [lng, lat]`). 2dsphere index enables geospatial queries.

- `backend/models/shop.model.js`:
  - `name`, `image`, `owner` (ObjectId -> User), `city`, `state`, `address`, `items` (array of Item ids).

- `backend/models/item.model.js`:
  - `name`, `description`, `image`, `shop` (ObjectId -> Shop), `category`, `categoryRef`, `price`, `stock`, `unit`, `featured`, `foodType` (`veg|non veg|n/a`), `rating` (subdocument: `average`, `count`).

- `backend/models/order.model.js` and `deliveryAssignment.model.js`:
  - Order: stores `shopOrders` array for multi-shop split orders, `user`, `totalAmount`, `deliveryAddress`, `payment` fields and payment provider ids.
  - DeliveryAssignment: broadcasts to multiple delivery boys and records acceptance/assignment.

----

## Backend middlewares

- `middlewares/isAuth.js` — verifies session token from cookie and sets `req.userId`.
- `middlewares/isAdmin.js` — checks `req.userId` role is `admin`.
- `middlewares/multer.js` — handles multipart file uploads for images before Cloudinary.

----

## Frontend: detailed structure and responsibilities

- Entry: [frontend/src/main.jsx](frontend/src/main.jsx)
  - Wraps `App` with `BrowserRouter` and Redux `Provider`.

- App and global initialization: [frontend/src/App.jsx](frontend/src/App.jsx)
  - Loads core data via hooks: current user, city, shop, items, categories, orders, and cart synchronization hooks.
  - Initializes Socket.IO client using `io(serverUrl, { withCredentials: true })`, dispatches socket to Redux using `setSocket`, and emits `identity` when connected.
  - Defines protected routes and role-based routes (admin path guarded by role check).

### Key hooks (what they do)

- `useGetCurrentUser` — makes `GET /api/user/current` and dispatches `setUserData`.
- `useLoadCart` — `GET /api/cart/my`, reads server cart and populates `user.cartItems` in Redux.
- `useSyncCart` — listens to Redux `cartItems` and, when `cartInitialized`, `POST /api/cart/sync` to persist server-side.
- `useUpdateLocation` — uses `navigator.geolocation.watchPosition` and `POST /api/user/update-location` with `{ lat, lon }`. Keeps user's location current for delivery matching.
- `useGetCategories`, `useGetCity`, `useGetShopByCity`, `useGetItemsByCity`, `useGetMyOrders` — small hooks that call respective APIs and update Redux or local state.

### Redux (store & slices)

- `frontend/src/redux/store.js` — configures Redux store with `user`, `owner`, and `map` slices. Disables serializable check for `user.setSocket` action because socket objects aren't serializable.

- `frontend/src/redux/userSlice.js` — main shape and reducers:
  - State: `userData`, `currentCity`, `cartItems`, `totalAmount`, `cartInitialized`, `myOrders`, `socket`, `categories`, etc.
  - Actions: `setUserData`, `addToCart`, `setCartItems`, `updateQuantity`, `removeCartItem`, `setMyOrders`, `updateRealtimeOrderStatus`, `setSocket`, etc.

Redux usage summary:
- Components dispatch `addToCart` / `updateQuantity` etc. The hooks `useSyncCart` and `useLoadCart` persist and restore cart state.
- `App.jsx` stores Socket.IO instance in Redux with `setSocket` so any component can emit/listen to events.

### Frontend pages & components

- `pages/` contain high-level views (SignIn/SignUp, Home, Shop, Cart, Checkout, MyOrders, TrackOrder, AdminDashboard, Owner pages).
- `components/` contain reusable UI pieces: `ProductCard`, `CategoryCard`, `CartItemCard`, `Nav`, `PageHeader`, `OwnerItemCard`, `UserOrderCard`, `DeliveryBoyTracking` etc.

----

## Typical workflows & where to look

- User sign-up/login
  - UI: `pages/SignUp.jsx`, `pages/SignIn.jsx`.
  - Frontend: submit form → `POST /api/auth/signup` or `POST /api/auth/signin`.
  - Backend: `auth.controllers.js` handles validation, hashing (`bcryptjs`), creates `User` document, issues cookie.

- Owner creates a shop & items
  - UI: `pages/CreateEditShop.jsx`, `pages/AddItem.jsx`.
  - Image upload handled via `multer` middleware, then uploaded to Cloudinary in controllers.

- Place order & delivery assignment
  - `pages/CheckOut.jsx` submits `POST /api/order/place-order` with grouped cart items.
  - Backend `placeOrder` groups items per shop, creates `Order`, if online payment configured creates Razorpay order.
  - For delivery: when owner updates shopOrder status to `out of delivery`, `order.controllers.updateOrderStatus` finds nearby delivery boys (geospatial query using `User.location`), creates `DeliveryAssignment`, emits `newAssignment` to delivery boys via Socket.

----

## Environment variables and secrets

- `MONGODB_URL` — MongoDB connection string (required).
- `CLOUDINARY_*` — Cloudinary config used by `backend/utils/cloudinary.js` (optional if images are stored elsewhere).
- `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` — for Razorpay integration (optional).
- Any JWT secret if used in `utils/token.js` (check file to confirm env var name).
- `VITE_SERVER_URL` — frontend build-time env for API base URL.

----

## Debugging & testing tips

- If Socket behavior not seen: ensure `frontend` `App.jsx` connects to same server URL and the backend `index.js` configured `io` CORS includes your frontend origin.
- Check cookies: APIs rely on cookie `token` set with `httpOnly`, send requests with `axios` option `{ withCredentials: true }`.
- To seed categories: `GET /api/category/` inserts default categories if collection empty.

----

## Where things live (quick links)

- Backend entry: [backend/index.js](backend/index.js)
- Socket logic: [backend/socket.js](backend/socket.js)
- Auth controllers: [backend/controllers/auth.controllers.js](backend/controllers/auth.controllers.js)
- Cart controllers: [backend/controllers/cart.controllers.js](backend/controllers/cart.controllers.js)
- Item controllers: [backend/controllers/item.controllers.js](backend/controllers/item.controllers.js)
- Order controllers: [backend/controllers/order.controllers.js](backend/controllers/order.controllers.js)
- User model: [backend/models/user.model.js](backend/models/user.model.js)
- Item model: [backend/models/item.model.js](backend/models/item.model.js)
- Shop model: [backend/models/shop.model.js](backend/models/shop.model.js)

- Frontend app: [frontend/src/App.jsx](frontend/src/App.jsx)
- Frontend entry: [frontend/src/main.jsx](frontend/src/main.jsx)
- Hooks: [frontend/src/hooks](frontend/src/hooks)
- Redux store: [frontend/src/redux/store.js](frontend/src/redux/store.js)
- User slice: [frontend/src/redux/userSlice.js](frontend/src/redux/userSlice.js)

----

## Next actions I can take (choose one)

1. Convert this Markdown to PDF and add it to `docs/PROJECT_DOCUMENTATION.pdf` (requires `pandoc` or a Node PDF tool). I can try a Node-based converter here.
2. Add sequence diagrams (text/ASCII or Mermaid) for: signup flow, place-order flow, delivery assignment flow.
3. Create a shorter 1-page executive summary PDF.

Tell me which option you prefer and I'll proceed.

(End)
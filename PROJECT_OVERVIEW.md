# Pickify Project Overview

## 1. Project Title
**Pickify - Smart Local Grocery Ordering and Delivery Platform**

## 2. Project Context
Pickify is a full-stack web application designed to digitalize local grocery shopping and last-mile delivery. The system connects customers, shop owners, delivery partners, and administrators through a single platform. It allows users to discover nearby grocery stores based on their city and live location, browse products by category, place orders, choose online or cash-on-delivery payment, and track order progress in real time.

The project addresses a common problem in local retail: many small grocery stores do not have a structured digital system for inventory display, order management, delivery assignment, and customer communication. Pickify solves this by providing a role-based platform where each stakeholder can manage their part of the workflow efficiently.

## 3. Problem Statement
Traditional neighborhood grocery shopping often depends on phone calls, manual communication, and unstructured delivery handling. This creates issues such as:

- No centralized product catalog
- Limited visibility of nearby stores
- Manual order tracking
- Delays in delivery partner assignment
- No digital invoice or order history
- Difficulty for administrators to monitor platform activity

Pickify provides an integrated solution that automates these operations through web technologies, geolocation, real-time communication, and role-based dashboards.

## 4. Main Objective
The main objective of Pickify is to build a smart grocery commerce platform that supports:

- customer-side product discovery and ordering
- shop-side inventory and order management
- delivery partner assignment and live tracking
- admin-level monitoring, reports, and role management

## 5. Core Users / Roles
The application supports four main user roles:

### Customer
- Sign up / sign in
- Detect current city using geolocation
- Browse stores available in the same city
- View grocery items by category
- Add items to cart
- Place delivery or self-pickup orders
- Pay using cash on delivery or Razorpay online payment
- Track order status and view invoice history

### Shop Owner
- Register and manage a shop profile
- Add, edit, and manage grocery items
- View incoming customer orders
- Update order status such as pending, preparing, out for delivery, and delivered
- Trigger delivery partner assignment for delivery orders

### Delivery Partner
- Receive nearby delivery assignments
- Accept available deliveries
- Share live location
- View active order route
- Complete delivery using OTP verification from the customer
- View daily delivery statistics

### Admin
- View platform-level dashboard statistics
- Monitor users, shops, items, and categories
- Manage user roles
- Create and delete categories
- Review order and revenue reports
- Track low-stock inventory items

## 6. Key Features Implemented
- Secure authentication using JWT and cookies
- Password reset using OTP email verification
- Optional Google-based authentication flow on frontend/backend
- Role-based dashboards for customer, owner, delivery partner, and admin
- Location-based city detection using browser geolocation and reverse geocoding
- Real-time order notifications using Socket.IO
- Cart persistence and backend synchronization
- Shop and product management
- Category-based browsing
- Multi-shop order grouping
- Delivery and pickup order methods
- Razorpay payment integration for online payments
- Delivery assignment based on nearby delivery partners
- OTP-based delivery confirmation
- Invoice generation for completed orders
- Admin analytics and reports

## 7. System Workflow
### Customer Flow
1. A user registers or logs in.
2. The system captures the user's location and identifies the current city.
3. Stores and grocery products for that city are loaded.
4. The user adds items to the cart and proceeds to checkout.
5. The order is placed using either online payment or cash on delivery.
6. The customer can track order progress in real time and access an invoice.

### Shop Owner Flow
1. The owner creates a shop profile.
2. The owner adds grocery products with category, price, stock, and image.
3. When a customer places an order, the owner receives a live notification.
4. The owner updates the order status.
5. If delivery is selected, the system broadcasts the order to nearby delivery partners.

### Delivery Flow
1. Nearby delivery partners receive assignment requests.
2. One available partner accepts the order.
3. The delivery partner location is updated live.
4. At delivery completion, the customer receives an OTP.
5. OTP verification marks the order as delivered.

### Admin Flow
1. Admin accesses a central management dashboard.
2. Dashboard shows users, shops, items, categories, revenue, recent orders, and stock alerts.
3. Admin can modify roles and manage categories.

## 8. Technology Stack
### Frontend
- React
- Vite
- Redux Toolkit
- React Router
- Tailwind CSS
- Axios
- React Leaflet / Leaflet
- Socket.IO Client
- Recharts

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT Authentication
- Cookie Parser
- Multer
- Cloudinary
- Nodemailer
- Razorpay

## 9. Database Design Summary
The backend uses MongoDB with Mongoose models. The main collections are:

- `User`: stores profile, role, authentication, socket state, and geolocation
- `Shop`: stores shop details and owner mapping
- `Item`: stores grocery item details, price, stock, category, and ratings
- `Cart`: stores customer cart items and total amount
- `Order`: stores customer orders, payment method, address, invoice, and shop-wise suborders
- `Category`: stores product category metadata
- `DeliveryAssignment`: stores delivery broadcast and assignment information

## 10. Architecture Overview
Pickify follows a client-server architecture:

- The **React frontend** handles UI, routing, state management, and user interactions.
- The **Express backend** provides REST APIs for authentication, users, shops, items, carts, categories, orders, and admin functions.
- **MongoDB** stores the platform data.
- **Socket.IO** enables real-time updates between customer, owner, and delivery partner dashboards.
- External services such as **Geoapify**, **Cloudinary**, **Nodemailer**, and **Razorpay** are used for geolocation, media storage, email OTP, and payment processing.

## 11. Project Highlights
- Real-world multi-role workflow
- Geolocation-based service discovery
- Real-time delivery communication
- Secure delivery completion using OTP
- Practical use of payment gateway integration
- Management dashboard for analytics and operations

## 12. Conclusion
Pickify is a practical final-year project that demonstrates full-stack development, API design, authentication, database modeling, geolocation, live socket communication, payment integration, and dashboard-based management. The project is suitable as a modern software engineering solution because it solves a real local-commerce problem while integrating multiple technologies into one complete system.

## 13. Short Summary for Report Abstract
Pickify is a full-stack grocery ordering and delivery platform built to connect customers, local shop owners, delivery partners, and administrators in one system. The application uses React for the frontend, Node.js and Express for the backend, MongoDB for data storage, and Socket.IO for real-time updates. Its main features include location-based shop discovery, product catalog management, cart and checkout flow, online payment support, delivery assignment, live tracking, OTP-based delivery confirmation, and admin analytics. The project demonstrates how modern web technologies can be used to digitalize local retail and improve the efficiency of grocery ordering and delivery operations.

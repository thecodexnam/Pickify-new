"""Generate a beginner-friendly Pickify project PDF guide (ASCII-safe)."""
from pathlib import Path
from fpdf import FPDF

OUT = Path(__file__).resolve().parent / "Pickify_Complete_Project_Guide.pdf"


class GuidePDF(FPDF):
    def header(self):
        if self.page_no() == 1:
            return
        self.set_font("Helvetica", "I", 9)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, "Pickify - Complete Project Guide (Beginner Friendly)", align="L")
        self.ln(4)
        self.set_draw_color(200, 200, 200)
        self.line(10, self.get_y(), 200, self.get_y())
        self.ln(6)

    def footer(self):
        self.set_y(-15)
        self.set_font("Helvetica", "I", 8)
        self.set_text_color(120, 120, 120)
        self.cell(0, 10, f"Page {self.page_no()}", align="C")

    def cover(self):
        self.add_page()
        self.ln(40)
        self.set_font("Helvetica", "B", 32)
        self.set_text_color(20, 90, 50)
        self.cell(0, 16, "PICKIFY", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(4)
        self.set_font("Helvetica", "B", 18)
        self.set_text_color(40, 40, 40)
        self.cell(0, 10, "Complete Project Guide", align="C", new_x="LMARGIN", new_y="NEXT")
        self.ln(6)
        self.set_font("Helvetica", "", 12)
        self.set_text_color(80, 80, 80)
        self.multi_cell(
            0,
            7,
            "A simple explanation of the entire project:\n"
            "folder structure, how everything works,\n"
            "and the role of every important file.",
            align="C",
        )
        self.ln(20)
        self.set_font("Helvetica", "", 11)
        self.set_text_color(60, 60, 60)
        self.cell(
            0,
            8,
            "For beginners and anyone learning the codebase",
            align="C",
            new_x="LMARGIN",
            new_y="NEXT",
        )
        self.ln(30)
        self.set_font("Helvetica", "I", 10)
        self.cell(
            0,
            6,
            "Local grocery marketplace | Customer / Owner / Rider / Admin",
            align="C",
            new_x="LMARGIN",
            new_y="NEXT",
        )

    def h1(self, text):
        self.ln(4)
        self.set_font("Helvetica", "B", 16)
        self.set_text_color(20, 90, 50)
        self.multi_cell(0, 9, text)
        self.set_draw_color(20, 90, 50)
        self.line(10, self.get_y(), 80, self.get_y())
        self.ln(5)
        self.set_text_color(30, 30, 30)

    def h2(self, text):
        self.ln(3)
        self.set_font("Helvetica", "B", 13)
        self.set_text_color(30, 70, 110)
        self.multi_cell(0, 8, text)
        self.ln(2)
        self.set_text_color(30, 30, 30)

    def h3(self, text):
        self.ln(2)
        self.set_font("Helvetica", "B", 11)
        self.set_text_color(50, 50, 50)
        self.multi_cell(0, 7, text)
        self.ln(1)
        self.set_text_color(30, 30, 30)

    def p(self, text):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(35, 35, 35)
        self.multi_cell(0, 5.5, text)
        self.ln(2)

    def bullet(self, text, indent=8):
        self.set_font("Helvetica", "", 10)
        self.set_text_color(35, 35, 35)
        x = self.get_x()
        self.set_x(x + indent)
        self.multi_cell(0, 5.5, f"-  {text}")
        self.ln(0.5)

    def code_block(self, text):
        self.set_fill_color(245, 247, 250)
        self.set_font("Courier", "", 8.5)
        self.set_text_color(40, 40, 40)
        for line in text.split("\n"):
            self.set_x(12)
            self.cell(186, 5, "  " + line, new_x="LMARGIN", new_y="NEXT", fill=True)
        self.ln(3)
        self.set_font("Helvetica", "", 10)

    def kv(self, key, value):
        self.set_font("Helvetica", "B", 10)
        self.set_text_color(30, 30, 30)
        self.multi_cell(0, 5.5, key + ":")
        self.set_font("Helvetica", "", 10)
        self.multi_cell(0, 5.5, "    " + value)
        self.ln(1)

    def table_row(self, cols, widths, bold=False):
        self.set_font("Helvetica", "B" if bold else "", 9)
        self.set_text_color(30, 30, 30)
        lines = []
        max_lines = 1
        for i, c in enumerate(cols):
            avail = widths[i] - 2
            words = str(c).split()
            built = [""]
            for w in words:
                test = (built[-1] + " " + w).strip()
                if self.get_string_width(test) <= avail:
                    built[-1] = test
                else:
                    built.append(w)
            lines.append(built)
            max_lines = max(max_lines, len(built))
        row_h = max_lines * 5
        y0 = self.get_y()
        if y0 + row_h > 280:
            self.add_page()
            y0 = self.get_y()
        x0 = self.get_x()
        if bold:
            self.set_fill_color(220, 235, 225)
        else:
            self.set_fill_color(250, 250, 250)
        for i, col_lines in enumerate(lines):
            x = x0 + sum(widths[:i])
            self.rect(x, y0, widths[i], row_h, style="DF" if bold else "D")
            self.set_xy(x + 1, y0 + 0.5)
            for line in col_lines:
                self.cell(widths[i] - 2, 5, line, new_x="LMARGIN", new_y="NEXT")
                self.set_x(x + 1)
        self.set_xy(x0, y0 + row_h)


def build():
    pdf = GuidePDF()
    pdf.set_auto_page_break(auto=True, margin=18)
    pdf.cover()

    pdf.add_page()
    pdf.h1("Table of Contents")
    for item in [
        "1. What is Pickify?",
        "2. Big Picture - How the Whole App Works",
        "3. Who Uses Pickify? (4 Roles)",
        "4. Tech Stack (Tools Used)",
        "5. Complete Folder Structure",
        "6. Backend Explained (Every Important File)",
        "7. Frontend Explained (Every Important File)",
        "8. Database Models (What Data Looks Like)",
        "9. API Routes Cheat Sheet",
        "10. Real-time Features (Socket.IO)",
        "11. Redux State (App Memory)",
        "12. User Journeys Step by Step",
        "13. How Frontend Talks to Backend",
        "14. Environment Variables Setup",
        "15. How to Run the Project",
        "16. Quick Glossary",
    ]:
        pdf.bullet(item, indent=4)

    pdf.add_page()
    pdf.h1("1. What is Pickify?")
    pdf.p(
        "Pickify is a local grocery marketplace website - think of a simpler version of "
        "Blinkit / Zepto / Swiggy Instamart made for nearby shops in your city."
    )
    pdf.p("In plain words, Pickify lets:")
    pdf.bullet(
        "Customers browse nearby grocery shops and products, add them to a cart, "
        "pay online or with cash, and get delivery or pick up themselves."
    )
    pdf.bullet("Shop owners create one shop, add products, manage stock, and process orders.")
    pdf.bullet(
        "Delivery riders receive nearby delivery jobs, accept them, navigate with a live map, "
        "and confirm delivery with an OTP."
    )
    pdf.bullet("Admins oversee the whole platform: users, shops, products, orders, and reports.")
    pdf.p(
        "Your city is detected from GPS (using Geoapify). Shops and items shown to you are "
        "filtered to that city, so you mainly see local options."
    )

    pdf.h1("2. Big Picture - How the Whole App Works")
    pdf.p("Pickify has two main parts that talk to each other:")
    pdf.h3("A) Frontend (what you see in the browser)")
    pdf.p(
        "Built with React + Vite. This is the website UI: pages for login, home, cart, checkout, "
        "shop management, delivery dashboard, and admin panel. It stores temporary app data in Redux "
        "and talks to the backend using Axios (HTTP) and Socket.IO (live updates)."
    )
    pdf.h3("B) Backend (the brain / server)")
    pdf.p(
        "Built with Node.js + Express. It receives API requests, checks login (JWT cookie), "
        "reads/writes MongoDB, uploads images to Cloudinary, sends OTP emails, creates Razorpay "
        "payments, and pushes live events with Socket.IO."
    )
    pdf.h3("C) Database (MongoDB)")
    pdf.p("Stores lasting data: users, shops, items, carts, orders, categories, and delivery assignments.")
    pdf.h3("Simple flow diagram")
    pdf.code_block(
        "Browser (React UI)\n"
        "   |  HTTP APIs + cookies\n"
        "   |  Socket.IO live events\n"
        "   v\n"
        "Express Server (backend/index.js)\n"
        "   |-- Controllers (business rules)\n"
        "   |-- Models (MongoDB schemas)\n"
        "   |-- Cloudinary / Email / Razorpay\n"
        "   v\n"
        "MongoDB Database"
    )

    pdf.h1("3. Who Uses Pickify? (4 Roles)")
    pdf.p("Every account has a role. The home screen changes based on that role.")

    pdf.h3("1) Customer (role: user)")
    pdf.bullet("Browse shops and items near their city")
    pdf.bullet("Search products, add to cart, checkout")
    pdf.bullet("Choose Delivery or Self-Pickup")
    pdf.bullet("Pay with Cash on Delivery (COD) or Razorpay (online)")
    pdf.bullet("Track order on map, view invoice")

    pdf.h3("2) Shop Owner (role: owner)")
    pdf.bullet("Create / edit one shop (name, image, address, city)")
    pdf.bullet("Add / edit / delete grocery items (price, stock, category, image)")
    pdf.bullet("Receive new orders (live notification)")
    pdf.bullet("Update order status: pending -> preparing -> out of delivery -> delivered")

    pdf.h3("3) Delivery Rider (role: deliveryBoy)")
    pdf.bullet("Share live GPS location with the server")
    pdf.bullet("See nearby delivery job offers (within about 5 km)")
    pdf.bullet("Accept a job, navigate with map")
    pdf.bullet("Send delivery OTP to customer email, verify OTP to complete delivery")
    pdf.bullet("See today's earnings chart (UI shows Rs.50 per delivery)")

    pdf.h3("4) Admin (role: admin)")
    pdf.bullet("View dashboard stats: users, shops, orders, revenue, low stock")
    pdf.bullet("Manage users and change roles")
    pdf.bullet("Manage categories and catalog overview")
    pdf.bullet("View reports")

    pdf.add_page()
    pdf.h1("4. Tech Stack (Tools Used)")
    pdf.p("You do not need to memorize these - just know what each layer does.")
    pdf.table_row(["Layer", "Technology", "Why it is used"], [40, 55, 91], bold=True)
    for r in [
        ["Frontend UI", "React 19 + Vite", "Build interactive web pages fast"],
        ["Styling", "Tailwind CSS", "Quick, consistent styling"],
        ["Routing", "React Router", "Pages like /cart, /signin"],
        ["App state", "Redux Toolkit", "Remember user, cart, city, socket"],
        ["HTTP calls", "Axios", "Call backend APIs with cookies"],
        ["Backend", "Node.js + Express", "API server and business logic"],
        ["Database", "MongoDB + Mongoose", "Store users, shops, orders"],
        ["Login", "JWT cookie + bcrypt", "Secure sessions and passwords"],
        ["Google login", "Firebase Auth", "Sign in with Google"],
        ["Live updates", "Socket.IO", "Order alerts and live rider map"],
        ["Maps", "Leaflet + Geoapify", "Show map and detect city/address"],
        ["Payments", "Razorpay", "Online payment checkout"],
        ["Images", "Multer + Cloudinary", "Upload product/shop photos"],
        ["Email OTP", "Nodemailer (Gmail)", "Password reset and delivery OTP"],
        ["Charts", "Recharts", "Delivery earnings graph"],
    ]:
        pdf.table_row(r, [40, 55, 91])
    pdf.ln(4)

    pdf.h1("5. Complete Folder Structure")
    pdf.p("The project root has two big folders: backend and frontend, plus docs.")
    pdf.code_block(
        "Pickify-new/\n"
        "+-- docs/                         # Documentation (this PDF lives here)\n"
        "+-- backend/                      # Server / API / database logic\n"
        "|   +-- index.js                  # Starts the whole server\n"
        "|   +-- socket.js                 # Live connection and location events\n"
        "|   +-- package.json              # Backend dependencies and scripts\n"
        "|   +-- .env                      # Secrets (DB URL, JWT, keys)\n"
        "|   +-- config/\n"
        "|   |   +-- db.js                 # Connect to MongoDB\n"
        "|   +-- middlewares/              # Guards before controllers run\n"
        "|   +-- models/                   # Database schema shapes\n"
        "|   +-- controllers/              # Business logic (the do-work code)\n"
        "|   +-- routes/                   # URL paths mapped to controllers\n"
        "|   +-- utils/                    # Helpers: JWT, email, Cloudinary\n"
        "+-- frontend/                     # Website the user sees\n"
        "    +-- index.html\n"
        "    +-- package.json\n"
        "    +-- vite.config.js\n"
        "    +-- firebase.js               # Google sign-in setup\n"
        "    +-- src/\n"
        "        +-- main.jsx              # React app entry\n"
        "        +-- App.jsx               # Routes + global hooks + socket\n"
        "        +-- pages/                # Full screens\n"
        "        +-- components/           # Reusable UI pieces\n"
        "        +-- hooks/                # Data loading / sync helpers\n"
        "        +-- redux/                # Global state slices\n"
        "        +-- data/                 # Grocery product presets\n"
        "        +-- utils/                # Distance / geo helpers\n"
        "        +-- assets/               # Images"
    )

    pdf.add_page()
    pdf.h1("6. Backend Explained (Every Important File)")
    pdf.p(
        "Think of the backend like a restaurant kitchen: routes are the waiter taking the order, "
        "controllers are the chefs cooking, models are the recipe books (data shape), and middleware "
        "is the security guard checking ID."
    )

    pdf.h2("6.1 Entry and realtime")
    pdf.kv(
        "backend/index.js",
        "Main door of the server. Creates Express app, enables CORS for Vite (ports 5173/5174), "
        "cookie parser, mounts all /api routes, starts Socket.IO, listens on PORT (default 5000).",
    )
    pdf.kv(
        "backend/socket.js",
        "Handles live events. When a user connects, stores their socketId and marks online. "
        "Delivery boys send updateLocation; server saves GPS and broadcasts updateDeliveryLocation. "
        "On disconnect, marks offline.",
    )

    pdf.h2("6.2 Config and middleware")
    pdf.kv("config/db.js", "Connects Mongoose to MONGODB_URL from .env.")
    pdf.kv(
        "middlewares/isAuth.js",
        "Checks JWT from cookie (or Bearer header). If valid, sets req.userId so controllers know who is calling.",
    )
    pdf.kv("middlewares/isAdmin.js", "After auth, loads the user and allows only role === admin.")
    pdf.kv("middlewares/multer.js", "Accepts uploaded image files and temporarily saves them under ./public.")

    pdf.h2("6.3 Models (database shapes)")
    pdf.kv(
        "models/user.model.js",
        "People on the platform: name, email, password, mobile, role, OTP fields, socketId, online status, GPS location.",
    )
    pdf.kv("models/shop.model.js", "A shop owned by one owner: name, image, city, state, address, list of items.")
    pdf.kv(
        "models/item.model.js",
        "A product: name, description, image, price, stock, unit, category, ratings, shop link.",
    )
    pdf.kv("models/cart.model.js", "One cart per user with line items and totalAmount.")
    pdf.kv(
        "models/order.model.js",
        "A placed order: payment method, delivery method, address, totals, and nested shopOrders "
        "(status, items, rider assignment, delivery OTP).",
    )
    pdf.kv(
        "models/deliveryAssignment.model.js",
        "A delivery job offer: which order/shop, who it was broadcast to, who accepted, status.",
    )
    pdf.kv("models/category.model.js", "Product categories (name, description, image). Seeds defaults if empty.")

    pdf.h2("6.4 Controllers (business logic)")
    pdf.p("Controllers contain the actual rules. Routes only point to them.")
    pdf.kv("auth.controllers.js", "Signup, signin, signout, OTP password reset, Google auth. Creates JWT cookie.")
    pdf.kv("user.controllers.js", "Get current logged-in user; update user location.")
    pdf.kv("shop.controllers.js", "Create/edit owner's shop; get my shop; list shops by city.")
    pdf.kv("item.controllers.js", "Add/edit/delete items; list by city/shop; search; rate items.")
    pdf.kv("cart.controllers.js", "Load cart, sync cart from frontend, clear cart.")
    pdf.kv(
        "order.controllers.js",
        "Place order (COD/Razorpay), verify payment, owner status updates, rider assignments, "
        "delivery OTP, invoices, today deliveries.",
    )
    pdf.kv("category.controllers.js", "List/create/update/delete categories.")
    pdf.kv("admin.controllers.js", "Admin dashboard, reports, users/roles, all orders, catalog overview.")

    pdf.h2("6.5 Routes (URL map)")
    pdf.p("Each routes file maps HTTP paths to controller functions, often behind isAuth / isAdmin.")
    pdf.bullet("auth.routes.js -> /api/auth")
    pdf.bullet("user.routes.js -> /api/user")
    pdf.bullet("shop.routes.js -> /api/shop")
    pdf.bullet("item.routes.js -> /api/item")
    pdf.bullet("cart.routes.js -> /api/cart")
    pdf.bullet("order.routes.js -> /api/order")
    pdf.bullet("category.routes.js -> /api/category")
    pdf.bullet("admin.routes.js -> /api/admin")

    pdf.h2("6.6 Utils (helpers)")
    pdf.kv("utils/token.js", "Creates a JWT that lasts 7 days.")
    pdf.kv("utils/mail.js", "Sends password-reset OTP and delivery OTP emails via Gmail/Nodemailer.")
    pdf.kv("utils/cloudinary.js", "Uploads a temp image to Cloudinary, deletes local temp file, returns secure URL.")

    pdf.add_page()
    pdf.h1("7. Frontend Explained (Every Important File)")

    pdf.h2("7.1 App startup")
    pdf.kv("frontend/src/main.jsx", "Starts React. Wraps the app with BrowserRouter (pages) and Redux Provider (global state).")
    pdf.kv(
        "frontend/src/App.jsx",
        "Heart of the UI. Defines serverUrl, runs all data hooks, opens Socket.IO, registers every route "
        "(signin, home, cart, checkout, shop pages, admin, tracking, invoice). Redirects guests to /signin.",
    )
    pdf.kv("frontend/firebase.js", "Configures Firebase Auth used for Google popup login.")
    pdf.kv("frontend/src/index.css", "Global styles / Tailwind setup.")
    pdf.kv("frontend/src/category.js", "Maps category names to local image assets (fallback visuals).")

    pdf.h2("7.2 Pages (full screens)")
    pdf.kv("pages/Home.jsx", "After login, shows the correct dashboard based on role (user / owner / deliveryBoy / admin).")
    pdf.kv(
        "pages/SignIn.jsx / SignUp.jsx / ForgotPassword.jsx",
        "Authentication screens. Signup can choose a role. Forgot password uses email OTP.",
    )
    pdf.kv("pages/CartPage.jsx", "Shows cart items and totals.")
    pdf.kv("pages/CheckOut.jsx", "Choose delivery or pickup, address on map, COD or Razorpay, place order.")
    pdf.kv("pages/OrderPlaced.jsx", "Success screen after ordering.")
    pdf.kv("pages/MyOrders.jsx", "Customer's order history list.")
    pdf.kv("pages/TrackOrderPage.jsx", "Live tracking map for delivery or pickup distance.")
    pdf.kv("pages/InvoicePage.jsx", "Printable / viewable invoice details.")
    pdf.kv("pages/Shop.jsx", "Browse one shop's products.")
    pdf.kv("pages/CreateEditShop.jsx", "Owner creates or edits their shop.")
    pdf.kv("pages/AddItem.jsx / EditItem.jsx", "Owner product forms (can use grocery presets).")
    pdf.kv("pages/AdminDashboard.jsx", "Admin-only management page.")

    pdf.h2("7.3 Components (UI building blocks)")
    pdf.kv("Nav.jsx", "Top navigation: search, cart icon, city, logout.")
    pdf.kv("PageHeader.jsx / AppFooter.jsx / EmptyState.jsx", "Shared layout / empty-list UI.")
    pdf.kv("UserDashboard.jsx", "Customer home: categories, nearby shops, products.")
    pdf.kv("OwnerDashboard.jsx", "Thin wrapper that opens ManagementDashboard in owner mode.")
    pdf.kv("ManagementDashboard.jsx", "Big shared panel for owner shop/orders AND admin tools.")
    pdf.kv("DeliveryBoy.jsx", "Rider dashboard: available jobs, current order, OTP, earnings chart.")
    pdf.kv(
        "ProductCard / CategoryCard / CartItemCard / OwnerItemCard",
        "Cards for listing products, categories, cart lines, owner inventory.",
    )
    pdf.kv("UserOrderCard / OwnerOrderCard", "Order summary cards for customer vs owner views.")
    pdf.kv(
        "DeliveryBoyTracking / PickupTracking / PickupDistanceInfo",
        "Leaflet map widgets for live rider tracking and pickup distance.",
    )

    pdf.h2("7.4 Hooks (automatic data loading)")
    pdf.p("Hooks run when the app loads and keep Redux updated.")
    pdf.kv("useGetCurrentUser", "GET /api/user/current -> who is logged in")
    pdf.kv("useGetCity", "GPS -> Geoapify reverse geocode -> currentCity / address")
    pdf.kv("useGetShopByCity / useGetItemsByCity", "Load shops and items for that city")
    pdf.kv("useGetCategories", "Load category list")
    pdf.kv("useGetMyShop", "Owner's shop data")
    pdf.kv("useGetMyOrders", "Orders for customer or owner")
    pdf.kv("useLoadCart / useSyncCart", "Load cart from DB; push cart changes back")
    pdf.kv("useUpdateLocation", "Send user GPS to backend")

    pdf.h2("7.5 Other frontend folders")
    pdf.kv("redux/", "Global memory: userSlice, ownerSlice, mapSlice, store.js (explained in section 11).")
    pdf.kv("data/groceryPresets.js", "Suggested Indian grocery products to speed up adding items.")
    pdf.kv("utils/geo.js", "Validate coordinates, haversine distance, pickup distance text.")

    pdf.add_page()
    pdf.h1("8. Database Models (What Data Looks Like)")
    pdf.p("MongoDB stores documents. Each model file defines the fields.")

    pdf.h3("User")
    pdf.bullet("fullName, email (unique), password (hashed), mobile")
    pdf.bullet("role: user | owner | deliveryBoy | admin")
    pdf.bullet("OTP fields for password reset")
    pdf.bullet("socketId, isOnline")
    pdf.bullet("location: GeoJSON Point with 2dsphere index (for nearby rider search)")

    pdf.h3("Shop")
    pdf.bullet("name, image, owner (User id), city, state, address")
    pdf.bullet("items[] - references to Item documents")
    pdf.bullet("Rule: one shop per owner (create-or-edit by owner id)")

    pdf.h3("Item")
    pdf.bullet("name, description, image, shop, category, price, stock, unit")
    pdf.bullet("featured flag, foodType (veg / non veg / n/a)")
    pdf.bullet("rating: { average, count }")

    pdf.h3("Cart")
    pdf.bullet("One cart document per user")
    pdf.bullet("items[] with item id, name, image, price, quantity, shop, foodType")
    pdf.bullet("totalAmount")

    pdf.h3("Order")
    pdf.bullet("user, invoiceNumber, paymentMethod (cod|online), deliveryMethod (delivery|pickup)")
    pdf.bullet("deliveryAddress, totalAmount, payment status, Razorpay ids")
    pdf.bullet("shopOrders[] - because one cart can contain products from multiple shops")
    pdf.bullet(
        "Each shopOrder has: shop, owner, subtotal, items, status, assignment, "
        "assignedDeliveryBoy, delivery OTP fields, deliveredAt"
    )

    pdf.h3("Order status machine (per shopOrder)")
    pdf.code_block(
        "pending  ->  preparing  ->  out of delivery  ->  delivered\n"
        "\n"
        "Pickup orders skip delivery-boy assignment."
    )

    pdf.h3("DeliveryAssignment")
    pdf.bullet("Links order + shop + shopOrderId")
    pdf.bullet("brodcastedTo[] (riders notified), assignedTo (who accepted)")
    pdf.bullet("status: brodcasted | assigned | completed")

    pdf.h3("Category")
    pdf.bullet("name (unique), description, image")
    pdf.bullet("If collection is empty, defaults are seeded automatically")

    pdf.add_page()
    pdf.h1("9. API Routes Cheat Sheet")
    pdf.p(
        "Base URL example: http://localhost:8000/api/...  Most routes need the login cookie "
        "except auth signup/signin/OTP/Google."
    )

    pdf.h3("Auth - /api/auth")
    pdf.table_row(["Method", "Path", "What it does"], [22, 55, 109], bold=True)
    for r in [
        ["POST", "/signup", "Create account + set JWT cookie"],
        ["POST", "/signin", "Login + set cookie"],
        ["GET", "/signout", "Clear cookie"],
        ["POST", "/send-otp", "Email password-reset OTP"],
        ["POST", "/verify-otp", "Check OTP"],
        ["POST", "/reset-password", "Set new password"],
        ["POST", "/google-auth", "Login/signup with Google"],
    ]:
        pdf.table_row(r, [22, 55, 109])
    pdf.ln(3)

    pdf.h3("User - /api/user")
    pdf.bullet("GET /current - who am I")
    pdf.bullet("POST /update-location - save {lat, lon}")

    pdf.h3("Shop - /api/shop")
    pdf.bullet("POST /create-edit - create or update owner's shop (+ image)")
    pdf.bullet("GET /get-my - owner's shop + items")
    pdf.bullet("GET /get-by-city/:city - shops in a city")

    pdf.h3("Item - /api/item")
    pdf.bullet("POST /add-item, POST /edit-item/:itemId, GET /delete/:itemId")
    pdf.bullet("GET /get-by-id/:itemId, /get-by-city/:city, /get-by-shop/:shopId")
    pdf.bullet("GET /search-items?query=&city= - search by name/category")
    pdf.bullet("POST /rating - rate an item 1-5")

    pdf.h3("Cart - /api/cart")
    pdf.bullet("GET /my - load cart")
    pdf.bullet("POST /sync - replace cart with client items")
    pdf.bullet("POST /clear - empty cart")

    pdf.h3("Order - /api/order")
    pdf.bullet("POST /place-order - COD order or create Razorpay order")
    pdf.bullet("POST /verify-payment - confirm Razorpay payment")
    pdf.bullet("GET /my-orders - customer orders OR owner's shop orders")
    pdf.bullet("POST /update-status/:orderId/:shopId - owner updates status; may notify riders")
    pdf.bullet("GET /get-assignments - pending jobs for rider")
    pdf.bullet("GET /accept-order/:assignmentId - rider accepts")
    pdf.bullet("GET /get-current-order - rider's active job")
    pdf.bullet("POST /send-delivery-otp / verify-delivery-otp - complete delivery")
    pdf.bullet("GET /get-order-by-id/:orderId - tracking details")
    pdf.bullet("GET /invoice/:orderId - invoice payload")
    pdf.bullet("GET /get-today-deliveries - rider hourly stats")

    pdf.h3("Category - /api/category")
    pdf.bullet("GET / - list (seed defaults if empty)")
    pdf.bullet("POST / , PUT /:id , DELETE /:id - admin manage")

    pdf.h3("Admin - /api/admin (auth + admin only)")
    pdf.bullet("GET /dashboard - counts, revenue, recent orders, low stock")
    pdf.bullet("GET /reports - revenue and product reports")
    pdf.bullet("GET /users , PUT /users/:userId/role - manage roles")
    pdf.bullet("GET /orders , GET /catalog")

    pdf.add_page()
    pdf.h1("10. Real-time Features (Socket.IO)")
    pdf.p(
        "Normal APIs are request -> response. Socket.IO keeps a live wire open so the server can "
        "push updates instantly without the page refreshing."
    )
    pdf.h3("Client -> Server")
    pdf.kv("identity", "Frontend sends userId after connect so server maps socket <-> user.")
    pdf.kv("updateLocation", "Delivery rider continuously sends GPS coordinates.")

    pdf.h3("Server -> Client")
    pdf.kv("newOrder", "Shop owner gets notified when a customer places an order.")
    pdf.kv("newAssignment", "Nearby free riders get a delivery job offer.")
    pdf.kv("update-status", "Order status changes are pushed live.")
    pdf.kv("updateDeliveryLocation", "Customer tracking page moves the rider marker on the map.")

    pdf.h3("Delivery matching (simple explanation)")
    pdf.bullet("Owner sets status to 'out of delivery' (for delivery orders, not pickup).")
    pdf.bullet("Backend finds online delivery boys within about 5 km of the delivery address (MongoDB $near).")
    pdf.bullet("Busy riders (already on an active assignment) are skipped.")
    pdf.bullet("Job is broadcast; first rider to accept becomes assigned.")

    pdf.h1("11. Redux State (App Memory)")
    pdf.p("Redux is like a shared notebook the whole React app can read/write.")

    pdf.h3("state.user (userSlice.js)")
    pdf.bullet("userData - logged-in user document")
    pdf.bullet("currentCity, currentState, currentAddress - from GPS")
    pdf.bullet("shopInMyCity, itemsInMyCity - catalog for the city")
    pdf.bullet("cartItems, totalAmount, cartInitialized - shopping cart")
    pdf.bullet("myOrders - order list")
    pdf.bullet("searchItems - search results")
    pdf.bullet("socket - Socket.IO client instance")
    pdf.bullet("categories - category records")

    pdf.h3("state.owner (ownerSlice.js)")
    pdf.bullet("myShopData - owner's shop including items")

    pdf.h3("state.map (mapSlice.js)")
    pdf.bullet("location { lat, lon } and address - heavily used on checkout map")

    pdf.add_page()
    pdf.h1("12. User Journeys Step by Step")

    pdf.h2("Customer journey")
    pdf.bullet("Open app -> if not logged in, go to Sign In / Sign Up")
    pdf.bullet("After login, GPS detects city; shops and items for that city load")
    pdf.bullet("Browse categories/products on UserDashboard; open a shop page")
    pdf.bullet("Add items to cart (Redux). useSyncCart saves cart to backend")
    pdf.bullet("Checkout: choose Delivery or Pickup; COD or Razorpay; set address")
    pdf.bullet("Order created -> owner gets newOrder socket event")
    pdf.bullet("Track at /track-order/:orderId; invoice at /invoice/:orderId")

    pdf.h2("Shop owner journey")
    pdf.bullet("Home shows OwnerDashboard / ManagementDashboard")
    pdf.bullet("Create shop once (name, photo, address/city)")
    pdf.bullet("Add products (optionally from grocery presets)")
    pdf.bullet("When orders arrive, update status step by step")
    pdf.bullet("When marked 'out of delivery', nearby riders are notified")

    pdf.h2("Delivery rider journey")
    pdf.bullet("Home shows DeliveryBoy dashboard; GPS shared via socket")
    pdf.bullet("See broadcast assignments; accept one")
    pdf.bullet("Navigate with map; send delivery OTP to customer email")
    pdf.bullet("Verify OTP -> order delivered; see today's earnings chart")

    pdf.h2("Admin journey")
    pdf.bullet("Open admin dashboard from Home or /admin")
    pdf.bullet("Review stats, reports, users, catalog, categories")
    pdf.bullet("Change user roles when needed")

    pdf.h1("13. How Frontend Talks to Backend")
    pdf.bullet(
        "REST: Axios calls use serverUrl from App.jsx with withCredentials: true so the "
        "httpOnly JWT cookie is sent automatically."
    )
    pdf.bullet("Session: signup/signin/Google set the cookie; useGetCurrentUser confirms who is logged in.")
    pdf.bullet("Cart: Redux is the UI source of truth; load from DB then sync changes back.")
    pdf.bullet("Realtime: Socket.IO client connects to the same serverUrl; identity + location + order events.")
    pdf.bullet(
        "Maps/Payments: Browser talks to Geoapify and Razorpay directly; payment verification still hits your backend."
    )
    pdf.bullet("Images: Owner uploads multipart form -> Multer temp file -> Cloudinary URL saved in MongoDB.")

    pdf.add_page()
    pdf.h1("14. Environment Variables Setup")

    pdf.h2("Backend .env")
    pdf.table_row(["Variable", "Purpose"], [70, 116], bold=True)
    for r in [
        ["MONGODB_URL", "MongoDB connection string"],
        ["PORT", "Server port (code default 5000)"],
        ["JWT_SECRET", "Secret to sign/verify login cookies"],
        ["EMAIL / PASS", "Gmail account for OTP emails"],
        ["CLOUDINARY_CLOUD_NAME", "Image hosting cloud name"],
        ["CLOUDINARY_API_KEY", "Cloudinary API key"],
        ["CLOUDINARY_API_SECRET", "Cloudinary API secret"],
        ["RAZORPAY_KEY_ID", "Online payments key id"],
        ["RAZORPAY_KEY_SECRET", "Online payments secret"],
    ]:
        pdf.table_row(r, [70, 116])
    pdf.ln(4)

    pdf.h2("Frontend .env (Vite)")
    pdf.table_row(["Variable", "Purpose"], [70, 116], bold=True)
    for r in [
        ["VITE_SERVER_URL", "Backend base URL (must match PORT)"],
        ["VITE_FIREBASE_APIKEY", "Google Auth via Firebase"],
        ["VITE_GEOAPIKEY", "Geoapify city/address lookup"],
        ["VITE_RAZORPAY_KEY_ID", "Razorpay checkout in browser"],
    ]:
        pdf.table_row(r, [70, 116])
    pdf.ln(4)
    pdf.p(
        "IMPORTANT: Backend default PORT is often 5000, while frontend fallback serverUrl may be "
        "http://localhost:8000. Set PORT and VITE_SERVER_URL to the SAME address or the UI cannot "
        "reach the API. CORS allows localhost:5173 and 5174 (Vite)."
    )

    pdf.h1("15. How to Run the Project")
    pdf.h3("1) Start MongoDB")
    pdf.p("Make sure MongoDB is running locally or use a MongoDB Atlas connection string in MONGODB_URL.")

    pdf.h3("2) Backend")
    pdf.code_block(
        "cd backend\n"
        "npm install\n"
        "# create/fill .env\n"
        "npm run dev          # uses nodemon index.js"
    )

    pdf.h3("3) Frontend")
    pdf.code_block(
        "cd frontend\n"
        "npm install\n"
        "# create/fill .env with matching VITE_SERVER_URL\n"
        "npm run dev          # usually http://localhost:5173"
    )

    pdf.h3("4) Open the app")
    pdf.p("Visit the Vite URL in your browser, sign up with a role, and explore.")

    pdf.h1("16. Quick Glossary")
    pdf.kv("API", "A URL the frontend calls to ask the backend to do something.")
    pdf.kv("JWT", "A signed login token stored in a cookie so the server trusts you.")
    pdf.kv("Cookie (httpOnly)", "Browser storage the JavaScript cannot easily steal; used for the JWT.")
    pdf.kv("Redux", "Central memory for React: user, cart, city, socket, etc.")
    pdf.kv("Hook", "React helper that runs logic (often fetch data) for components.")
    pdf.kv("Controller", "Backend function that contains business rules for one action.")
    pdf.kv("Model / Schema", "The shape of a MongoDB document (fields and types).")
    pdf.kv("Middleware", "Code that runs before a controller (auth checks, file upload).")
    pdf.kv("Socket.IO", "Live two-way connection for instant updates.")
    pdf.kv("COD", "Cash on Delivery - pay when groceries arrive.")
    pdf.kv("GeoJSON Point", "A location stored as longitude/latitude for map and nearby queries.")
    pdf.kv("Cloudinary", "Online service that stores uploaded images and returns a URL.")

    pdf.ln(8)
    pdf.h2("You now understand Pickify end to end")
    pdf.p(
        "If you remember only one mental model: the frontend is the storefront, the backend is the "
        "warehouse manager, MongoDB is the inventory book, and Socket.IO is the walkie-talkie for "
        "live delivery updates. Every folder in this project exists to support that story."
    )
    pdf.p("PDF generated for learning and onboarding. Open this file anytime you need a map of the codebase.")

    pdf.output(str(OUT))
    print(f"Wrote: {OUT}")
    return OUT


if __name__ == "__main__":
    build()

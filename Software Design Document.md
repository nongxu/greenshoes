# Greenshoes Project Documentation

## 1. Introduction

Greenshoes is a modern web application built to showcase high-quality footwear. The project uses Next.js for the frontend, Express.js as the backend server, and PostgreSQL for data persistence. Its aim is to provide a seamless shopping experience, with dynamic product listings, user authentication (via NextAuth), and an efficient database schema that supports orders, users, and product management.

---

## 2. Revision Table

| Version | Date        | Author      | Changes/Comments                   |
|---------|-------------|-------------|------------------------------------|
| 1.0     | 2025-04-10  | Your Name   | Initial version of the project.    |
| 1.1     | 2025-04-15  | Your Name   | Added NextAuth-based authentication, seeded dummy data, and updated database schema. |
| 1.2     | 2025-04-20  | Your Name   | Refined component structure, improved UI styles, and updated documentation. |

---

## 3. Software Architecture

Greenshoes follows a multi-tier architecture:
- **Frontend:** Built with Next.js, provides server-side rendering and efficient routing.
- **Backend:** Implemented using Express.js to serve additional API endpoints (e.g., for products).
- **Authentication:** Managed via NextAuth.js with a credentials provider.
- **Database:** PostgreSQL stores users, admins, products, orders, and order items.
- **Seed & Schema:** SQL scripts and a seed script (using Faker) support rapid development and testing.

---

## 4. Explanation of Each Component

### 4.1 Next.js Client
- **Pages:**  
  - `index.js` – Homepage showcasing features and products.
  - `products-listing.js` – Lists all products with links to detailed product pages.
  - `signin.js` – Handles user login via NextAuth.
- **Components:**  
  - `Layout.js` – Provides a consistent UI layout and theming across pages.
- **Styles:**  
  - Global CSS styles and modules that define the visual appearance of components.

### 4.2 Express Backend
- **server.js:**  
  - Integrates Express with Next.js, creates API endpoints (e.g., `/api/products`), and initializes the PostgreSQL database connection.
- **Routes:**  
  - Custom routes (stored in the `/routes` directory) that allow RESTful interactions with product data.

### 4.3 Authentication (NextAuth.js)
- Configured in `pages/api/auth/[...nextauth].js`, it uses a credentials provider to verify user logins and manage session state via JSON Web Tokens (JWT).

### 4.4 Database
- **Connection:**  
  - `db/connection.js` sets up a PostgreSQL connection using the pg Pool.
- **Schema:**  
  - `db/schema.sql` defines tables for users, admins, products, orders, order items, and user order history.
- **Seeding:**  
  - `seed.js` uses Faker.js to populate dummy data for testing.

---

## 5. Component Selection Criteria (SBOM)

An SBOM (Software Bill of Materials) is maintained for the project dependencies:
- **Frontend Packages:**  
  - `next` – Enables SSR and SSG.
  - `react`, `react-dom` – Core libraries for building interactive UIs.
  - `js-cookie` – Manages client‑side cookie storage.
- **Backend Packages:**  
  - `express` – Simplifies server and API endpoint creation.
  - `dotenv` – Loads environment variables from the `.env` file.
  - `pg` – PostgreSQL client for Node.js.
- **Authentication:**  
  - `next-auth` – Simplifies user authentication in Next.js.
- **Development Tools:**  
  - `nodemon` – Auto-restarts the server during development.
  - `@faker-js/faker` – Generates dummy data for seeding the database.

---

## 6. Designs

### 6.1 UI/UX Designs
- **Screen Layouts:**  
  - A clean, grid‑based design is used on the product listing page.
  - Responsive design principles are applied for mobile and desktop.
- **Style Guides:**  
  - A consistent color palette (greens for eco‑friendly, blue for call‑to‑action) is used across the application.
  - Button and input styling is standardized via component and global CSS.

### 6.2 Database Design
- **Tables:**  
  - **Users:** Stores user details, authentication data, and order history.
  - **Admins:** Contains administrative login info.
  - **Products:** Holds product information like name, price, description, stock quantity, and category.
  - **Orders & Order Items:** Capture details of purchases including individual items ordered.
- **Relationships:**  
  - Foreign key constraints ensure data integrity between orders, order items, and user order history.

---

## 7. Packages, Classes, and Structures

### 7.1 Packages (Dependencies)
Refer to the `package.json` file for a full list of dependencies. Key packages include Next.js, Express, PostgreSQL (pg), NextAuth, and Faker.

### 7.2 Main Classes / Structures
- **Express Server:**  
  - Bootstrapped in `server.js`, it combines Express middleware with Next.js request handling.
- **Database Pool:**  
  - Configured in `db/connection.js`, it provides a reusable pool connection to PostgreSQL.
- **Authentication Handlers:**  
  - Configurations in `[...nextauth].js` specify credential authorization and session management.

---

## 8. Database Design

The database schema (see `db/schema.sql`) includes the following major tables:
- **users:**  
  - Columns: id (UUID), email, password_hash, full_name, phone, address, created_at.
- **admins:**  
  - Columns: id, email, password_hash, created_at.
- **products:**  
  - Columns: id, name, description, price, stock_quantity, shoe_category, created_at, updated_at.
- **orders, order_items, user_order_history:**  
  - Designed to track order transactions, complex shopping cart data, and order status.

Seeding is performed with `seed.js` to generate dummy entries for users and products for testing and demonstration.

---

## 9. Screenshots

*Note: Add screenshots here as images generated from your application running on http://localhost:3000.*

![Homepage](./public/screenshots/homepage.png)
![Product Listing](./public/screenshots/products-listing.png)
![Signin Page](./public/screenshots/signin.png)

---

## 10. Installation Notes

1. **Clone the Repository and Install Dependencies:**
   ```
   git clone <repository-url>
   cd greenshoes
   npm install
   npm install js-cookie
   ```

2. **Set Up Environment Variables:**
   - Create a `.env` file in the project root. Example contents:
     ```
     DB_USER=postgres
     DB_HOST=localhost
     DB_NAME=greenshoes
     DB_PASSWORD=your_postgres_password
     DB_PORT=5432
     ```

3. **Set Up the Database:**
   - **Execute the Database Schema:**  
     From the project root, run:
     ```
     psql -U postgres -d greenshoes -f db/schema.sql
     ```
   - **Seed the Database with Dummy Data:**
     ```
     node seed.js
     ```

4. **Start the Application:**
   - **Express Server:**  
     ```
     node server.js
     ```
   - **Next.js Development Server:**  
     ```
     npm run dev
     ```

5. **Access the Application:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 11. Final Remarks

Greenshoes is designed to be a scalable, full‑stack application demonstrating modern web technologies. The architecture separates concerns between the frontend (Next.js), backend (Express), and data management (PostgreSQL). With built‑in authentication via NextAuth and a dynamic product experience, the project serves as both a robust learning exercise and an extendable ecommerce platform.

Contributions and enhancements are welcome. Please refer to the Contributing section in the README for guidelines.

---

*End of Documentation*
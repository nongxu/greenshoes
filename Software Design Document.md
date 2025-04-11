# Greenshoes Project Documentation

## 1. Introduction

Greenshoes is a modern web application built to showcase high-quality footwear. The project uses Next.js for the frontend, Express.js as the backend server, and PostgreSQL for data persistence. Its aim is to provide a seamless shopping experience, with dynamic product listings, user authentication (via NextAuth), and an efficient database schema that supports orders, users, and product management.

---

## 2. Revision Table

| Version | Date        | Changes/Comments                                                                                     |
|---------|-------------|------------------------------------------------------------------------------------------------------|
| 1.0     | 2025-02-21  | Initial version of the project.                                                                     |
| 1.1     | 2025-02-28  | Completed research on critical architectural components and finalized the architecture document.     |
| 1.2     | 2025-03-21  | Deployed the main architecture and created the web diagram to visualize system interactions.         |
| 1.3     | 2025-03-28  | Implemented landing pages, the home page, and the product page. Researched and integrated NextAuth. |
| 1.4     | 2025-04-04  | Completed database schema refinement, critical design document updates, and map routing features.    |
| 1.5     | 2025-04-11  | Developed and tested APIs, refined critical design document (CDD), SDD, and ensured database alignment. |


---

## 3. Software Architecture

Greenshoes follows a multi-tier architecture:
- **Frontend:** Built with Next.js, provides server-side rendering and efficient routing.
- **Backend:** Implemented using Express.js to serve additional API endpoints (e.g., for products).
- **Authentication:** Managed via NextAuth.js with a credentials provider.
- **Database:** PostgreSQL stores users, admins, products, orders, and order items.

---
## 4. Explanation of Each Component
### 4.1 Component Selection Criteria (SBOM)

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
### 4.2 Designs

#### 4.2.1 Packages (Dependencies)
Refer to the `package.json` file for a full list of dependencies. Key packages include Next.js, Express, pg, NextAuth, and Faker.

#### 4.2.2 Main Classes
- **Express Server:**  
  - Bootstrapped in `server.js`, it combines Express middleware with Next.js request handling.
- **Database Pool:**  
  - Configured in `db/connection.js`, it provides a reusable pool connection to PostgreSQL.
- **Authentication Handlers:**  
  - Configurations in `[...nextauth].js` specify credential authorization and session management.

#### 4.2.3 Structures
```
greenshoes/
├── components/                     
│   └── Layout.js                   
│
├── db/                            
│   ├── connection.js               
│   └── schema.sql                  
│
├── pages/                          
│   ├── admin/                     
│   │   └── dashboard.js            
│   │
│   ├── api/                       
│   │   └── auth/                   
│   │       └── [...nextauth].js   
│   │
│   ├── user/                       
│   │   └── dashboard.js            
│   │
│   ├── products-listing.js        
│   ├── signin.js                   
│   ├── index.js                    # Homepage
│   └── _app.js                     
│
├── public/                         
│   └── favicon.ico                 
│
├── routes/                         
│   └── products.js                
│
├── styles/                        
│   ├── globals.css                        
│
├── .env                           
├── package.json                   
├── README.md                      
├── seed.js                                      
└── server.js  
```
---
#### 4.2.4 Database Design

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

![db schema](image.png)
---

#### 4.2.5 Screenshots

![Homepage](image-1.png)
![Product listing](image-2.png)
![signin](image-3.png)
![signup](image-4.png)

---

## 6. Installation Notes

1. **Clone the Repository and Install Dependencies:**
   ```
   git clone https://github.com/yangboxin/greenshoes
   cd greenshoes
   npm install
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
   - **Make sure posgresql is installed on your computer**
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

5. **Access the Application:**
   - Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## 6. Final Remarks

Greenshoes is designed to be a scalable, full‑stack application demonstrating modern web technologies. The architecture separates concerns between the frontend (Next.js), backend (Express), and data management (PostgreSQL). With built‑in authentication via NextAuth and a dynamic product experience, the project serves as both a robust learning exercise and an extendable ecommerce platform.


---

*End of Documentation*
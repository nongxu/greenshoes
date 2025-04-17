# greenshoes Project

## Overview
Greenshoes is a web application built using Next.js for the frontend and Express.js for the backend, with PostgreSQL as the database. This project aims to provide a seamless experience for users while showcasing the capabilities of modern web technologies.

## Features
- **Next.js**: A React framework that enables server-side rendering and static site generation.
- **Express.js**: A minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.
- **PostgreSQL**: A powerful, open-source object-relational database system that uses and extends the SQL language.

## Project Structure
```
greenshoes
├── components
│   └── Layout.js
├── db
│   └── connection.js
├── pages
│   ├── index.js
│   └── _app.js
├── public
│   └── favicon.ico
├── server.js
├── next.config.js
├── package.json
├── .env
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (version 14 or later)
- PostgreSQL (version 12 or later)

### Installation
1. Clone the repository:
   ```
   git clone <repository-url>
   cd greenshoes
   ```

2. Install dependencies:
   ```
   npm install
   ```


3. Set up the environment variables:
   - Create a `.env` file in the root directory and add your PostgreSQL connection string and any other necessary environment variables.

### Setting Up the Database

1. **Execute the Database Schema:**

   Open your terminal, navigate to the project root, and run the following command to create the necessary tables in your PostgreSQL database. Replace `<your_db_username>` and `<your_db_name>` with your actual database credentials. For example, if your username is `postgres` and your database is `greenshoes`:

   ```
   psql -U postgres -d greenshoes -f db/schema.sql
   ```

2. **Seed the Database with Dummy Data:**

   Once the schema is in place, run the seed script to populate the database with dummy data:

   ```
   node seed.js
   ```
   
   This script will insert dummy users and products using Faker.

### Running the Application

1. Start the Express server:
   ```
   node server.js
   ```

2. Open your browser and navigate to `http://localhost:3000` to view the application.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.
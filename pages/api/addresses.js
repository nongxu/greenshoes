//Development use only
/*const express = require('express');
const router = express.Router();

router.get('/addresses', (req, res) => {
  res.status(200).json([
    "123 Green Street, NY",
    "456 Blue Ave, LA"
  ]);
});

module.exports = router;*/

import { getSession } from "next-auth/react";
import { pool } from "../db/connection";

export default async function handler(req, res) {
  // Retrieve the session from the request
  const session = await getSession({ req });

  // If there's no session, return an unauthorized error
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    // Use session.user.id to fetch the user's addresses from the database.
    const userAddresses = await getUserAddresses(session.user.id);
    return res.status(200).json(userAddresses);
  } catch (err) {
    console.error("Error fetching addresses:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// DB lookup function using the existing pool from db/connection.js
export async function getUserAddresses(userId) {
  const client = await pool.connect();
  try {
    const result = await client.query(
      "SELECT address FROM users WHERE id = $1",
      [userId]
    );
    
    // If an address exists, return it as an array; otherwise, return an empty array.
    if (result.rows.length > 0 && result.rows[0].address) {
      return [result.rows[0].address];
    }
    return [];
  } finally {
    client.release();
  }
}

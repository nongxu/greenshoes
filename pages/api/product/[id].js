import { pool } from '../../../db/connection';

export default async function handler(req, res) {
    const { id } = req.query;

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).json({ message: `Method ${req.method} not allowed` });
    }

    try {
        const client = await pool.connect();
        const query = `
            SELECT 
                p.id,
                p.name,
                p.description,
                p.price,
                p.stock_quantity,
                p.shoe_category,
                p.created_at,
                p.updated_at,
                pi.image_url AS image
            FROM 
                products p
            LEFT JOIN 
                product_images pi 
            ON 
                p.id = pi.product_id AND pi.is_primary = true
            WHERE 
                p.id = $1
            LIMIT 1;
        `;
        const result = await client.query(query, [id]);
        client.release();

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Product not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching product:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
}
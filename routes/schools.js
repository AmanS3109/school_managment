const express = require('express');
const { body, query, validationResult } = require('express-validator');
const pool = require('../db');

const router = express.Router();

// Add School
router.post(
  '/addSchool',
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('address').trim().notEmpty().withMessage('Address is required'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const { name, address, latitude, longitude } = req.body;
    try {
      const [result] = await pool.execute(
        `INSERT INTO schools (name, address, latitude, longitude) VALUES (?, ?, ?, ?)`,
        [name, address, latitude, longitude]
      );
      res.status(201).json({ id: result.insertId, name, address, latitude, longitude });
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

// List Schools sorted by proximity
router.get(
  '/listSchools',
  [
    query('latitude').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
    query('longitude').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(400).json({ errors: errors.array() });

    const userLat = parseFloat(req.query.latitude);
    const userLon = parseFloat(req.query.longitude);

    // Haversine formula to calculate distance in kilometers
    const sql = `
      SELECT id, name, address, latitude, longitude,
        (6371 * ACOS(
          COS(RADIANS(?)) * COS(RADIANS(latitude)) *
          COS(RADIANS(longitude) - RADIANS(?)) +
          SIN(RADIANS(?)) * SIN(RADIANS(latitude))
        )) AS distance_km
      FROM schools
      ORDER BY distance_km ASC;
    `;

    try {
      const [rows] = await pool.execute(sql, [userLat, userLon, userLat]);
      res.json(rows);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Database error' });
    }
  }
);

module.exports = router;

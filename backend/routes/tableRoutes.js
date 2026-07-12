const express = require('express');
const router = express.Router();
const { getTables, createTable, seedTables } = require('../controllers/tableController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/').get(protect, getTables).post(protect, admin, createTable);
router.post('/seed', seedTables); // accessible without auth for testing, or could protect it

module.exports = router;

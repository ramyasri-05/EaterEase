const express = require('express');
const router = express.Router();
const {
    createReservation,
    getMyReservations,
    cancelReservation,
    getAllReservations,
    updateReservation
} = require('../controllers/reservationController');
const { protect, admin } = require('../middleware/authMiddleware');

router.route('/')
    .post(protect, createReservation)
    .get(protect, admin, getAllReservations);

router.route('/myreservations')
    .get(protect, getMyReservations);

router.route('/:id')
    .put(protect, admin, updateReservation)
    .delete(protect, cancelReservation); // Delete maps to cancel

module.exports = router;

const Reservation = require('../models/Reservation');
const Table = require('../models/Table');

// Customer: Create reservation
const createReservation = async (req, res) => {
    try {
        const { date, timeSlot, guests } = req.body;
        
        // Find all tables that can fit the guests
        const tables = await Table.find({ capacity: { $gte: guests } }).sort('capacity');
        
        if (tables.length === 0) {
            return res.status(400).json({ message: 'No tables available for this capacity' });
        }

        // Find available table for the time slot
        let assignedTable = null;
        for (let table of tables) {
            const existingReservation = await Reservation.findOne({
                table: table._id,
                date: new Date(date),
                timeSlot,
                status: 'confirmed'
            });

            if (!existingReservation) {
                assignedTable = table;
                break;
            }
        }

        if (!assignedTable) {
            return res.status(400).json({ message: 'No tables available for the selected time and date' });
        }

        const reservation = await Reservation.create({
            user: req.user._id,
            table: assignedTable._id,
            date: new Date(date),
            timeSlot,
            guests
        });

        res.status(201).json(await reservation.populate('table'));
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ message: 'Table already booked for this time slot' });
        } else {
            res.status(500).json({ message: error.message });
        }
    }
};

// Customer: Get own reservations
const getMyReservations = async (req, res) => {
    try {
        const reservations = await Reservation.find({ user: req.user._id }).populate('table').sort('-date');
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Customer/Admin: Cancel reservation
const cancelReservation = async (req, res) => {
    try {
        const reservation = await Reservation.findById(req.params.id);
        
        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (reservation.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized to cancel this reservation' });
        }

        reservation.status = 'cancelled';
        await reservation.save();

        res.json({ message: 'Reservation cancelled successfully', reservation });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Get all reservations (optionally by date)
const getAllReservations = async (req, res) => {
    try {
        const query = {};
        if (req.query.date) {
            query.date = new Date(req.query.date);
        }
        
        const reservations = await Reservation.find(query)
            .populate('user', 'name email')
            .populate('table')
            .sort('-date');
            
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Admin: Update reservation
const updateReservation = async (req, res) => {
    try {
        const { date, timeSlot, guests, table, status } = req.body;
        const reservation = await Reservation.findById(req.params.id);

        if (!reservation) {
            return res.status(404).json({ message: 'Reservation not found' });
        }

        if (date) reservation.date = new Date(date);
        if (timeSlot) reservation.timeSlot = timeSlot;
        if (guests) reservation.guests = guests;
        if (table) reservation.table = table;
        if (status) reservation.status = status;

        await reservation.save();
        res.json(await reservation.populate('table'));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    createReservation,
    getMyReservations,
    cancelReservation,
    getAllReservations,
    updateReservation
};

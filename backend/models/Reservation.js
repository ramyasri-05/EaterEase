const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    table: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Table',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    timeSlot: {
        type: String,
        required: true
        // format e.g. "18:00", "19:00"
    },
    guests: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    }
}, { timestamps: true });

// Prevent overlapping reservations for same table, date and time
reservationSchema.index({ table: 1, date: 1, timeSlot: 1 }, { unique: true, partialFilterExpression: { status: 'confirmed' } });

const Reservation = mongoose.model('Reservation', reservationSchema);
module.exports = Reservation;

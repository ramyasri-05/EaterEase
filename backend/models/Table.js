const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    number: {
        type: Number,
        required: true,
        unique: true
    },
    capacity: {
        type: Number,
        required: true
    }
}, { timestamps: true });

const Table = mongoose.model('Table', tableSchema);
module.exports = Table;

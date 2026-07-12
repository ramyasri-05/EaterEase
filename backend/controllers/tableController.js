const Table = require('../models/Table');

const getTables = async (req, res) => {
    try {
        const tables = await Table.find({});
        res.json(tables);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const createTable = async (req, res) => {
    try {
        const { number, capacity } = req.body;
        const tableExists = await Table.findOne({ number });

        if (tableExists) {
            return res.status(400).json({ message: 'Table number already exists' });
        }

        const table = await Table.create({ number, capacity });
        res.status(201).json(table);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const seedTables = async (req, res) => {
    try {
        const count = await Table.countDocuments();
        if (count === 0) {
            const tables = [
                { number: 1, capacity: 2 },
                { number: 2, capacity: 2 },
                { number: 3, capacity: 4 },
                { number: 4, capacity: 4 },
                { number: 5, capacity: 6 },
                { number: 6, capacity: 8 }
            ];
            await Table.insertMany(tables);
            res.status(201).json({ message: 'Tables seeded successfully', tables });
        } else {
            res.status(400).json({ message: 'Tables already exist' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTables, createTable, seedTables };

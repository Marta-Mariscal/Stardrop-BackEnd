const mongoose = require('mongoose')

const orderSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    garments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Garment'
    }]
}, {
    timestamps: true
})


const Order = mongoose.model('Order', orderSchema)

module.exports = Order
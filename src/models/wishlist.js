const mongoose = require('mongoose')

const wishlistSchema = new mongoose.Schema({
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    garments: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Garment'
    }]
}, {
    timestamps: true
})


const Wishlist = mongoose.model('Wishlist', wishlistSchema)

module.exports = Wishlist
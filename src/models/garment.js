const mongoose = require('mongoose')

const garmentSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: Boolean,
        default: false
    },
    size: {
        type: String,
        required: true,
        trim: true
    },
    colors: [{
        color: {
            type: String,
            enum: ['red', 'pink', 'purple', 'blue', 'green', 'yellow', 'orange', 'brown', 'black', 'white'],
            required: true
        }
    }],
    price: {
        type: Number,
        required: true,
        validate(value) {
            if (value < 0) {
                throw new Error('Price must be a positive number')
            }
        }
    },
    category: {
        type: String,
        enum: ['shirt', 'pant', 'dress', 'outerwear', 'accessory', 'other', 'footwear'],
        required: true
    },
    gender: {
        type: String,
        enum: ['man', 'woman', 'unisex', 'child'],
        required: true
    },
    image: {
        type: String,
        validate(value) {
            if (!value.match(/\.(jpg|jpeg|png)$/)) {
                throw new Error('Image must be a valid URL')
            }
        }
    },
    type: {
        type: String,
        enum: ['new', 'second-hand'],
        required: true
    },
    web: {
        type: String,
        trim: true,
        validate(value) {
            if (!validator.isURL(value)) {
                throw new Error('Website is invalid')
            }
        }
    },
    status: {
        type: String,
        enum: ['Brand New', 'Like new', 'Used', 'Fair condition', 'Damaged'],
        default: 'Used'
    },
    owner: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    }
}, {
    timestamps: true
})

// esto en verda no me hace falta pa na los dos virtuals
garmentSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'garments'
})

garmentSchema.virtual('wishlist', {
    ref: 'Wishlist',
    localField: '_id',
    foreignField: 'garments'
})

const Garment = mongoose.model('Garment', garmentSchema)

module.exports = Garment
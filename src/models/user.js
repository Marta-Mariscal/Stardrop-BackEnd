const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is invalid')
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"')
            }
        }
    },
    address: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isMobilePhone(value, 'any')) {
                throw new Error('Phone number is invalid')
            }
        }
    },
    type: {
        type: String,
        enum: ['customer', 'company'],
        required: true
    },
    description: {
        type: String,
        trim: true
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
    cardNumber: {
        type: String,
        trim: true,
        validate(value) {
            if (!validator.isCreditCard(value)) {
                throw new Error('Card number is invalid')
            }
        }
    },
    cardExpirationDate:{
        type: String,
        validate(value) {
            // Comprobar formato MM/YY con regex
            if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(value)) {
                throw new Error('Card expiration date format is invalid (use MM/YY)');
            }

            // Validar que no sea una fecha pasada
            const [month, year] = value.split('/').map(Number);
            const now = new Date();
            const currentYear = now.getFullYear() % 100; // últimos 2 dígitos
            const currentMonth = now.getMonth() + 1; // enero es 0

            if (year < currentYear || (year === currentYear && month < currentMonth)) {
                throw new Error('Card expiration date is expired');
            }
    }
    },
    cardHolderName:{
        type: String,
        trim: true
    },
    cardCVV:{
        type: String,
        trim: true,
        length: 3,
        validate(value) {
            if (!validator.isNumeric(value)) {
                throw new Error('CVV is invalid')
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    icon: {
        type: String,
        validate(value) {
            if (!value.match(/\.(jpg|jpeg|png)$/)) {
                throw new Error('Image must be a valid URL')
            }
        }
    }
}, {
    timestamps: true
})

userSchema.virtual('garments', {
    ref: 'Garment',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('orders', {
    ref: 'Order',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.virtual('wishlist', {
    ref: 'Wishlist',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)

    user.tokens = user.tokens.concat({ token })
    await user.save()

    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email }) 

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

userSchema.pre('save', async function (next) {
    const user = this

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }

    next()
})

// TODO: Delete user garments when user is removed
// userSchema.pre('remove', async function (next) {
//     const user = this
//     await Garment.deleteMany({ owner: user._id })
//     next()
// })

const User = mongoose.model('User', userSchema)

module.exports = User
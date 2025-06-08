const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        },
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        totalPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

orderSchema.virtual("orderItems", {
    ref: "OrderItem",
    localField: "_id",
    foreignField: "order"
});

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

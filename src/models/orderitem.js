const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema(
    {
        order: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Order"
        },
        garment: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Garment"
        },
        size: {
            type: String,
            trim: true,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true,
            min: 0
        }
    },
    {
        timestamps: true
    }
);

orderItemSchema.set("toObject", { virtuals: true });
orderItemSchema.set("toJSON", { virtuals: true });

const OrderItem = mongoose.model("OrderItem", orderItemSchema);

module.exports = OrderItem;

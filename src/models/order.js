const mongoose = require("mongoose");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";

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

orderSchema.methods.toJSON = function () {
    const order = this;
    const orderObject = order.toObject();

    if (orderObject?.owner?.icon && !orderObject.owner.icon.startsWith(BASE_URL)) {
        orderObject.owner.icon = `${BASE_URL}${orderObject.owner.icon}`;
    }

    if (orderObject?.orderItems?.length) {
        orderObject.orderItems = orderObject.orderItems.map(item => {
            if (item?.garment?.image && !item.garment.image.startsWith(BASE_URL)) {
                item.garment.image = `${BASE_URL}${item.garment.image}`;
            }
            if (item?.garment?.owner?.icon && !item.garment.owner.icon.startsWith(BASE_URL)) {
                item.garment.owner.icon = `${BASE_URL}${item.garment.owner.icon}`;
            }
            return item;
        });
    }

    return orderObject;
};

orderSchema.set("toObject", { virtuals: true });
orderSchema.set("toJSON", { virtuals: true });

const Order = mongoose.model("Order", orderSchema);

module.exports = Order;

const express = require("express");
const Order = require("../models/order");
const OrderItem = require("../models/orderitem");
const auth = require("../middleware/auth");
const router = new express.Router();

router.post("/order", auth, async (req, res) => {
    const orderItems = req.body;

    if (!Array.isArray(orderItems) || !orderItems.length) {
        return res.status(400).send({ data: null, error: { status: 400, message: "Order items must be a non-empty array." } });
    }

    const totalPrice = orderItems.reduce((total, item) => total + item.unitPrice * item.quantity, 0);

    const order = new Order({
        owner: req.user._id,
        totalPrice
    });

    try {
        await order.save();

        const items = orderItems.map(
            (item) =>
                new OrderItem({
                    ...item,
                    garment: item.base._id,
                    order: order._id
                })
        );

        await OrderItem.insertMany(items);

        const output = await Order.findById(order._id).populate("owner", "name icon").populate("orderItems");

        res.status(201).send({ data: { order: output }, error: null });
    } catch (e) {
        res.status(400).send({ data: null, error: { status: 400, message: e.message, exception: e } });
    }
});

router.get("/order", auth, async (req, res) => {
    try {
        const orders = await Order.find({ owner: req.user._id })
            .populate("owner", "name icon")
            .populate({
                path: "orderItems",
                model: "OrderItem",
                populate: {
                    path: "garment",
                    model: "Garment",
                    populate: {
                        path: "owner",
                        model: "User",
                        select: "name icon"
                    }
                }
            })
            .sort({ createdAt: -1 });

        res.status(200).send({ data: { orders }, error: null });
    } catch (e) {
        res.status(400).send({ data: null, error: { status: 400, message: e.message, exception: e } });
    }
});

module.exports = router;

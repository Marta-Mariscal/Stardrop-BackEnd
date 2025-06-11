const express = require("express");
const Wishlist = require("../models/wishlist");
const auth = require("../middleware/auth");
const router = new express.Router();

router.get("/wishlist", auth, async (req, res) => {
    try {
        const user = await req.user.populate("wishlist");

        if (!user.wishlist?.length) {
            return res.status(404).send({ data: null, error: { status: 404, message: "Wishlist not found", exception: null } });
        }

        const wishlist = user.wishlist[0];

        const output = await wishlist.populate({
            path: "garments",
            model: "Garment",
            populate: {
                path: "owner",
                model: "User",
                select: "name icon"
            }
        });

        output.garments.reverse();

        res.send({ data: { wishlist: output.garments }, error: null });
    } catch (error) {
        res.status(500).send({ data: null, error: { status: 500, message: error.message, exception: error } });
    }
});

router.post("/wishlist/:id", auth, async (req, res) => {
    const garmentId = req.params.id;

    if (!garmentId) {
        return res.status(400).send({ data: null, error: { status: 400, message: "Garment ID is required", exception: null } });
    }

    try {
        const user = await req.user.populate("wishlist");

        if (!user.wishlist?.length) {
            return res.status(404).send({ data: null, error: { status: 404, message: "Wishlist not found", exception: null } });
        }

        const wishlist = user.wishlist[0];
        const existingItem = wishlist.garments.find((item) => item._id.toString() === garmentId);

        if (existingItem) {
            return res.status(400).send({ data: null, error: { status: 400, message: "Item already exists in wishlist", exception: null } });
        }

        wishlist.garments.push({ _id: garmentId });
        await wishlist.save();

        res.status(201).send({ data: { message: "Item added to wishlist" }, error: null });
    } catch (error) {
        res.status(400).send({ data: null, error: { status: 400, message: error.message, exception: error } });
    }
});

router.delete("/wishlist/:id", auth, async (req, res) => {
    const garmentId = req.params.id;

    if (!garmentId) {
        return res.status(400).send({ data: null, error: { status: 400, message: "Garment ID is required", exception: null } });
    }

    try {
        const user = await req.user.populate("wishlist");

        if (!user.wishlist?.length) {
            return res.status(404).send({ data: null, error: { status: 404, message: "Wishlist not found", exception: null } });
        }

        const wishlist = user.wishlist[0];
        wishlist.garments = wishlist.garments.filter((item) => item._id.toString() !== garmentId);
        await wishlist.save();

        res.send({ data: { message: "Item removed from wishlist" }, error: null });
    } catch (error) {
        res.status(500).send({ data: null, error: { status: 500, message: error.message, exception: error } });
    }
});

module.exports = router;

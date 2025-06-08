const express = require("express");
const multer = require("multer");
const Garment = require("../models/garment");
const auth = require("../middleware/auth");
const upload = require("../controller/upload");
const router = new express.Router();

router.post("/garment", auth, upload.single("image"), async (req, res) => {
    const garmentData = JSON.parse(req.body.garment);

    if (req.file) {
        garmentData.image = req.file.path;
    }

    const garment = new Garment({
        ...garmentData,
        owner: req.user._id
    });

    try {
        await garment.save();
        res.status(201).send({ data: { garment }, error: null });
    } catch (e) {
        res.status(400).send({ data: null, error: { status: 400, message: e.message, exception: e } });
    }
});

router.get("/garment/:id", auth, async (req, res) => {
    if (!req.params.id) {
        return res.status(400).send({ data: null, error: { status: 400, message: "Garment ID is required" } });
    }

    try {
        const garment = await Garment.findOne({ _id: req.params.id }).populate("owner", "name icon");

        if (!garment) {
            return res.status(404).send({ data: null, error: { status: 404, message: "Garment not found" } });
        }

        res.send({ data: { garment }, error: null });
    } catch (e) {
        res.status(500).send({ data: null, error: { status: 500, message: "Fetch garment failed", exception: e } });
    }
});

router.get("/garment", auth, async (req, res) => {
    const match = {};
    const sort = {};

    if (req.query.search) {
        const regex = new RegExp(req.query.search, "i");
        match.$or = [{ name: { $regex: regex } }, { description: { $regex: regex } }];
    }

    if (req.query.categories) {
        const categories = req.query.categories.split(",").map((category) => category.trim());
        match.category = { $in: categories };
    }

    if (req.query.genders) {
        const genders = req.query.genders.split(",").map((gender) => gender.trim());
        match.gender = { $in: genders };
    }

    if (req.query.colors) {
        const colors = req.query.colors.split(",").map((color) => color.trim());
        match.colors = { $in: colors };
    }

    if (req.query.types) {
        const types = req.query.type.split(",").map((type) => type.trim());
        match.type = { $in: types };
    }

    if (req.query.states) {
        const states = req.query.states.split(",").map((status) => status.trim());
        match.status = { $in: states };
    }

    if (req.query.minPrice) {
        match.price = { $gte: req.query.minPrice };
    }
    if (req.query.maxPrice) {
        match.price = { ...match.price, $lte: req.query.maxPrice };
    }

    if (req.query.me) {
        match.owner = req.user._id;
    } else {
        match.owner = { $ne: req.user._id };
    }

    if (req.query.garmentBase) {
        match.garmentBase = req.query.garmentBase;
    }

    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(":");
        sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
    }

    try {
        const garments = await Garment.find(match)
            .sort(sort)
            .limit(req.query.limit ? parseInt(req.query.limit) : 20)
            .skip(req.query.skip ? parseInt(req.query.skip) : 0)
            .populate("owner", "name");
        res.send({ data: { garments }, error: null });
    } catch (e) {
        res.status(500).send({ data: null, error: { status: 500, message: "Fetch garments failed", exception: e } });
    }
});

//postman
router.delete("/garment/:id", auth, async (req, res) => {
    try {
        const garment = await Garment.findOneAndDelete({ _id: req.params.id});
        
        if (!garment) {
            return res.status(404).send({ data: null, error: { status: 404, message: "Garment not found" } });
        }

        res.send({ data: { garment }, error: null });
    } catch (e) {
        res.status(500).send({ data: null, error: { status: 500, message: "Delete garment failed", exception: e } });
    }
});

module.exports = router;

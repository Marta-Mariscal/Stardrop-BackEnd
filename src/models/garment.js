const mongoose = require("mongoose");
const validator = require("validator");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";

const garmentSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        description: {
            type: String
        },
        size: {
            type: String,
            trim: true
        },
        colors: [
            {
                type: String,
                enum: ["red", "pink", "purple", "blue", "green", "yellow", "orange", "brown", "black", "white"],
                required: true
            }
        ],
        price: {
            type: Number,
            required: true,
            validate(value) {
                if (value < 0) {
                    throw new Error("Price must be a positive number");
                }
            }
        },
        category: {
            type: String,
            enum: ["shirt", "pant", "dress", "outerwear", "accessory", "other", "footwear"],
            required: true
        },
        gender: {
            type: String,
            enum: ["man", "woman", "unisex", "child"],
            required: true
        },
        image: {
            type: String,
            validate(value) {
                if (!value.match(/\.(jpg|jpeg|png)$/)) {
                    throw new Error("Image must be a valid URL");
                }
            }
        },
        type: {
            type: String,
            enum: ["new", "second-hand"],
            required: true
        },
        web: {
            type: String,
            trim: true,
            validate(value) {
                if (!validator.isURL(value)) {
                    throw new Error("Website is invalid");
                }
            }
        },
        status: {
            type: String,
            enum: ["brand-new", "like-new", "used", "fair-condition", "damaged"]
        },
        soldOut: {
            type: Boolean,
            default: false
        },
        garmentBase: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Garment"
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "User"
        }
    },
    {
        timestamps: true
    }
);

garmentSchema.virtual("garmentsSecondHand", {
    ref: "Garment",
    localField: "_id",
    foreignField: "garmentBase"
});

garmentSchema.virtual("orders", {
    ref: "Order",
    localField: "_id",
    foreignField: "garments"
});

garmentSchema.virtual("wishlist", {
    ref: "Wishlist",
    localField: "_id",
    foreignField: "garments"
});

garmentSchema.methods.toJSON = function () {
    const garment = this;
    const garmentObject = garment.toObject();

    if (garmentObject.image) {
        garmentObject.image = `${BASE_URL}${garmentObject.image}`;
    }

    if (garmentObject?.owner?.icon) {
        garmentObject.owner.icon = `${BASE_URL}${garmentObject.owner.icon}`;
    }

    return garmentObject;
};

garmentSchema.pre("save", async function (next) {
    const garment = this;

    if (garment.image && garment.image.startsWith(BASE_URL)) {
        garment.image = garment.image.replace(BASE_URL, "");
    }

    next();
});

garmentSchema.set("toObject", { virtuals: true });
garmentSchema.set("toJSON", { virtuals: true });

const Garment = mongoose.model("Garment", garmentSchema);

module.exports = Garment;

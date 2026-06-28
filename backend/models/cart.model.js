import mongoose from "mongoose";


const cartItemSchema = new mongoose.Schema({
    item: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Item",
        required: true
    },
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        default: ""
    },
    price: {
        type: Number,
        required: true
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop",
        required: true
    },
    foodType: {
        type: String,
        default: "n/a"
    }
}, { _id: false });

const cartSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true
    },
    items: {
        type: [cartItemSchema],
        default: []
    },
    totalAmount: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;

import mongoose from "mongoose";

const itemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        default: ""
    },
    image: {
        type: String,
        required: true
    },
    shop: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shop"
    },
    categoryRef: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category",
        default: null
    },
    category: {
        type: String,
        enum: ["Produce",
            "Dairy & Eggs",
            "Beverages",
            "Snacks",
            "Pantry",
            "Meat & Seafood",
            "Household",
            "Personal Care",
            "Bakery",
            "Others"
        ],
        required:true
    },
    price:{
        type:Number,
        min:0,
        required:true
    },
    stock: {
        type: Number,
        min: 0,
        default: 0
    },
    unit: {
        type: String,
        default: "pieces"
    },
    featured: {
        type: Boolean,
        default: false
    },
    foodType:{
        type:String,
        enum:["veg","non veg","n/a"],
        required:true
    },
   rating:{
    average:{type:Number,default:0},
    count:{type:Number,default:0}
   }
}, { timestamps: true })

const Item=mongoose.model("Item",itemSchema)
export default Item

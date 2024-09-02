import mongoose from "mongoose";

const schema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    price: {
        type: Number,
        required: true,
        min: [0, 'Price must be greater than 0']
    },
    availableUnits: {
        type: Number,
        default: 1000
    },
    soldUnits: {
        type: Number,
        default: 0
    },
})

schema.virtual('totalUnits').get(function () {
    return this.availableUnits + this.soldUnits
})

export const Product = mongoose.model('Product', schema)
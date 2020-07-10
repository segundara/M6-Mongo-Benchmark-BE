const { Schema, model } = require("mongoose")
const mongoose = require("mongoose")
const v = require("validator")

const ProductSchema = new Schema({
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    brand: {
        type: String,
        required: true,
    },
    imageUrl: {
        type: String,
    },
    price: {
          type: Number,
          required: true,
    },
    category: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
    },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],    
      
},{ timestamps: true })

ProductSchema.pre('save', function(next){
    this.updatedAt = Date.now();
    next();
  });

ProductSchema.static("findProductWithReviews", async function (productId) {
    const product = await ProductModel.findOne({ _id: productId }).populate("reviews")
    return product
  })

const ProductModel = model("Product", ProductSchema)
module.exports = ProductModel


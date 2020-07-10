const { Schema } = require("mongoose")
const mongoose = require("mongoose")
const v = require("validator")

const ProductCartSchema = new Schema({
  _id: Schema.Types.ObjectId,
  name: String,
  description: String,
  brand: String,
  imageUrl: String,
  price: Number,
  category: String,
  createdAt: Date,
  updatedAt: Date,
  reviews: [{ _id: Schema.Types.ObjectId, comment: String, rate: Number, createdAt: Date }],
  quantity: Number,
})

const CustomerSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    cart: [ProductCartSchema],
  },
  { timestamps: true }
)

CustomerSchema.static("findProductInCart", async function (id, productId) {
  const isProductThere = await CustomerModel.findOne({
    _id: id,
    "cart._id": productId,
  })
  return isProductThere
})

CustomerSchema.static("incrementCartQuantity", async function (
  id,
  productId,
  quantity
) {
  await CustomerModel.findOneAndUpdate(
    {
      _id: id,
      "cart._id": productId,
    },
    { $inc: { "cart.$.quantity": quantity } }
  )
})

CustomerSchema.static("addProductToCart", async function (id, product) {
  await CustomerModel.findOneAndUpdate(
    { _id: id },
    {
      $addToSet: { cart: product },
    }
  )
})

CustomerSchema.static("removeProductFromCart", async function (id, productId) {
  await CustomerModel.findByIdAndUpdate(id, {
    $pull: { cart: { _id: productId } },
  })
})

CustomerSchema.static("calculateCartTotal", async function (id) {
  const { cart } = await CustomerModel.findById(id)
  return cart
    .map((product) => product.price * product.quantity)
    .reduce((acc, el) => acc + el, 0)
})

CustomerSchema.post("validate", function (error, doc, next) {
  if (error) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

CustomerSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

const CustomerModel = mongoose.model("Customer", CustomerSchema)

module.exports = CustomerModel
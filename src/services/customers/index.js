const express = require("express")
const q2m = require("query-to-mongo")
const { Types } = require("mongoose")

const CustomerModel = require("./schema")
const  ProductModel  = require("../products/schema")

const customersRouter = express.Router()

customersRouter.get("/", async (req, res, next) => {
  try {
    const query = q2m(req.query)
    const customers = await CustomerModel.find(query.criteria, query.options.fields)
      .skip(query.options.skip)
      .limit(query.options.limit)
      .sort(query.options.sort)

    res.send({
      data: customers,
      total: customers.length,
    })
  } catch (error) {
    next(error)
  }
})

customersRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const customer = await CustomerModel.findById(id)
    res.send(customer)
  } catch (error) {
    console.log(error)
    next("While reading customers list a problem occurred!")
  }
})

customersRouter.post("/", async (req, res, next) => {
  try {
    const newCustomer = new CustomerModel(req.body)
    const { _id } = await newCustomer.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

customersRouter.put("/:id", async (req, res, next) => {
  try {
    const customer = await CustomerModel.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
      },
      { runValidators: true }
    )
    if (customer) {
      res.send("Ok")
    } else {
      const error = new Error(`customer with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

customersRouter.delete("/:id", async (req, res, next) => {
  try {
    await CustomerModel.findByIdAndDelete(req.params.id)

    res.send("Deleted")
  } catch (error) {
    next(error)
  }
})

customersRouter.post("/:id/add-to-cart/:productId", async (req, res, next) => {
  try {
    //1. Find the product by ID
    const product = await ProductModel.findProductWithReviews(req.params.productId)
    if (product) {
      const newProduct = { ...product.toObject(), quantity: 1 }
      //2. Check in customer's cart if the product is already there

      const isProductThere = await CustomerModel.findProductInCart(
        req.params.id,
        req.params.productId
      )
      if (isProductThere) {
        // the product is already in the cart
        //3. Increment the quantity
        await CustomerModel.incrementCartQuantity(
          req.params.id,
          req.params.productId,
          1
        )
        res.send("Quantity incremented")
      } else {
        // the product is not in the cart
        await CustomerModel.addProductToCart(req.params.id, newProduct)
        res.send("New product added!")
      }
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

customersRouter.delete("/:id/remove-from-cart/:productId", async (req, res, next) => {
  try {
    await CustomerModel.removeProductFromCart(req.params.id, req.params.productId)
    res.send("Removed")
  } catch (error) {
    next(error)
  }
})

customersRouter.get("/:id/calculate-cart-total", async (req, res, next) => {
  try {
    const total = await CustomerModel.calculateCartTotal(req.params.id)
    res.send({ total })
  } catch (error) {
    next(error)
  }
})

module.exports = customersRouter

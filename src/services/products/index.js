const express = require("express")

const fs = require("fs-extra")
const path = require("path")
const multer = require("multer")

const upload = multer()
const port = process.env.PORT

const imagePath = path.join(__dirname, "../../../public/image/products")

const q2m = require("query-to-mongo")

const ProductModel = require("./schema")

const productsRouter = express.Router()

productsRouter.get("/", async (req, res, next) => {
  try {
    const parsedQuery = q2m(req.query)
    console.log(parsedQuery)
      const products = await ProductModel.find(parsedQuery.criteria, parsedQuery.options.fields).populate("reviews")
      .skip(parsedQuery.options.skip)
      .limit(parsedQuery.options.limit)
      .sort(parsedQuery.options.sort)
      res.send({numberOfItems: products.length, data: products})
      console.log(products)
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/:id/reviews", async (req, res, next) => {
  try {
    const productReviews = await ProductModel.findProductWithReviews(req.params.id)
    res.send({ productReviews })
  } catch (error) {
    next(error)
  }
})

productsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const product = await ProductModel.findProductWithReviews(id)
    res.send({product})
  } catch (error) {
    next(error)
  }
})

productsRouter.post("/", async (req, res, next) => {
  try {
    const newProduct = new ProductModel(req.body)
    
    const { _id } = await newProduct.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

productsRouter.post("/:id/upload", upload.single("product"), async (req, res, next) => {

  try {
    await fs.writeFile(path.join(imagePath, `${req.params.id}.png`), req.file.buffer)
    
    req.body = {
      imageUrl: `http://127.0.0.1:${port}/image/products/${req.params.id}.png`
    }
    const product = await ProductModel.findByIdAndUpdate(req.params.id, req.body)
    if (product) {
      res.send("Record updated!")
    } else {
      const error = new Error(`Product with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
    
  } catch (error) {
    next(error)
  }

})

productsRouter.put("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findByIdAndUpdate(req.params.id, req.body)
    if (product) {
      res.send("Record updated!")
    } else {
      const error = new Error(`Product with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

productsRouter.delete("/:id", async (req, res, next) => {
  try {
    const product = await ProductModel.findByIdAndDelete(req.params.id)
    if (product) {
      res.send("Deleted")
    } else {
      const error = new Error(`Product with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

module.exports = productsRouter
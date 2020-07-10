const express = require("express")

const q2m = require("query-to-mongo")

const ReviewSchema = require("./schema")

const reviewsRouter = express.Router()

reviewsRouter.get("/", async (req, res, next) => {
  try {
    const reviews = await ReviewSchema.find(req.query)
    res.send(reviews)
  } catch (error) {
    next(error)
  }
})

reviewsRouter.get("/:id", async (req, res, next) => {
  try {
    const id = req.params.id
    const review = await ReviewSchema.findById(id)
    if (review) {
      res.send(review)
    } else {
      const error = new Error()
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    console.log(error)
    next("While reading reviews list a problem occurred!")
  }
})

reviewsRouter.post("/", async (req, res, next) => {
  try {
    const newReview = new ReviewSchema(req.body)
    
    const { _id } = await newReview.save()

    res.status(201).send(_id)
  } catch (error) {
    next(error)
  }
})

reviewsRouter.put("/:id", async (req, res, next) => {
  try {
    const review = await ReviewSchema.findByIdAndUpdate(req.params.id, 
      {
        ...req.body,
      },
      { runValidators: true }
    )
    if (review) {
      res.send("Record updated!")
    } else {
      const error = new Error(`Review with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

reviewsRouter.delete("/:id", async (req, res, next) => {
  try {
    const review = await ReviewSchema.findByIdAndDelete(req.params.id)
    if (review) {
      res.send("Deleted")
    } else {
      const error = new Error(`Review with id ${req.params.id} not found`)
      error.httpStatusCode = 404
      next(error)
    }
  } catch (error) {
    next(error)
  }
})

module.exports = reviewsRouter
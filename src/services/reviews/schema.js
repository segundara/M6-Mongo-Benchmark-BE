const { Schema, model } = require("mongoose")
const mongoose = require("mongoose")
const v = require("validator")

const ReviewSchema = new Schema({
  comment: {
    type: String,
    required: true,
  },
  rate: {
    type: Number,
    min: [1, "Sorry you can't rate below 1!"],
    max: [5, "Maximum rating is 5"],
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
})

ReviewSchema.post("validate", function (error, doc, next) {
  if (error) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

ReviewSchema.post("save", function (error, doc, next) {
  if (error.name === "MongoError" && error.code === 11000) {
    error.httpStatusCode = 400
    next(error)
  } else {
    next()
  }
})

//const ReviewModel = model("Review", ReviewSchema)
module.exports = model("Review", ReviewSchema)
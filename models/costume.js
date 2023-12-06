// COSTUME MODEL

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const costumeSchema = new Schema (
    //Schema Definition for Costume Model Inventory Management
    {
      costumeName: {
        type: String,
        required: true
      },
      category: {
        type: String,
        required: true
      },
      rentalFee: {
        type: Number,
        required: true
      },
      size: {
        type: String,
        required: true
      },
      imageUrl: {
        type: String,
        required: true
      },
      description: {
        type: String,
        required: true
      },
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
      }
    })

module.exports = mongoose.model('Costume', costumeSchema);
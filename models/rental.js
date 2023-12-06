// RENTAL MODEL

const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const rentalSchema = new Schema({
  //Schema Definition for Rental Management
  costumes: [
    {
      costume: {
        type: Object, 
        required: true
      },
      quantity: {
        type: Number, 
        required: true,
      }
    }
  ],
  rentalDate: {
    type: Date,
    default: new Date(Date.now())
  },
  returnDate: {
    type: Date,
    default: new Date(Date.now() + 12096e5)
  },
  user: {
    email: {
      type: String, 
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true
    }
  }
},
{ timestamps: true}
);

module.exports = mongoose.model('Rental', rentalSchema);
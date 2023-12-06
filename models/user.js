// USER MODEL

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema ({
    //Schema Definition for User Management

    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    admin: {
        type: String,
        required: false,
    },
    cart: {
        items: [{
            costumeId: {
                type: Schema.Types.ObjectId,
                ref: 'Costume',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            }
        }]
    }
})

//Sample Method: 
// Add to Cart Method
userSchema.methods.addToCart = function(costume) {
    const cartCostumeIndex = this.cart.items.findIndex(cp => cp.costumeId.toString() === costume._id.toString());

    let newQuantity = 1;
    const updatedCartItems = [...this.cart.items];

    if (cartCostumeIndex >= 0) {
        newQuantity = parseInt(updatedCartItems[cartCostumeIndex].quantity) + 1;
        updatedCartItems[cartCostumeIndex].quantity = newQuantity;
    } else {
        updatedCartItems.push({
            costumeId: costume._id,
            quantity: newQuantity
        });
    }

    this.cart.items = updatedCartItems;
    return this.save();
};

// Remove from Cart Method
userSchema.methods.removeFromCart = function(costumeId) {
    const updatedCartItems = this.cart.items.filter(item => item.costumeId.toString() !== costumeId.toString());
    this.cart.items = updatedCartItems;
    return this.save();
};

// Clear Cart Method
userSchema.methods.clearCart = function() {
    this.cart.items = [];
    return this.save();
};
module.exports = mongoose.model('User', userSchema);
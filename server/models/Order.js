const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [{
    foodItem: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' },
    quantity: { type: Number, default: 1 },
    price: { type: Number }
  }],
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  totalPrice: { type: Number, required: true },
  deliveryAddress: { type: String, required: true },
  status: { type: String, default: 'Processing', enum: ['Processing', 'Cooking', 'On the way', 'Delivered'] },
  createdAt: { type: Date, default: Date.now },
  deliveryTime: { type: String }
});

module.exports = mongoose.model('Order', orderSchema);
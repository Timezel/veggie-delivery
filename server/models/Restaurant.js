const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  image: { type: String },
  city: { type: String, required: true },
  rating: { type: Number, default: 0 },
  foodItems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'FoodItem' }],
  deliveryTime: { type: String },
  deliveryFee: { type: Number, default: 0 }
});

module.exports = mongoose.model('Restaurant', restaurantSchema);
const mongoose = require('mongoose');

const foodItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String },
  restaurant: { type: mongoose.Schema.Types.ObjectId, ref: 'Restaurant', required: true },
  isVegan: { type: Boolean, default: false },
  isVegetarian: { type: Boolean, default: true },
  ingredients: [{ type: String }]
});

module.exports = mongoose.model('FoodItem', foodItemSchema);
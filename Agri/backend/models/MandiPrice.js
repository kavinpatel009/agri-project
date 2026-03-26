const mongoose = require('mongoose');

const MandiPriceSchema = new mongoose.Schema({
  city: { type: String, required: true },
  region: { type: String, default: 'Gujarat' },
  prices: [
    {
      crop: { type: String, required: true },
      modal: { type: Number, required: true },
      min: { type: Number },
      max: { type: Number },
    }
  ],
  updatedBy: { type: String, default: 'admin' }
}, { timestamps: true });

module.exports = mongoose.model('MandiPrice', MandiPriceSchema);

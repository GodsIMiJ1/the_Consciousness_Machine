const mongoose = require('mongoose');

const campaignSchema = new mongoose.Schema({
  type: { type: String, required: true },
  targetList: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Contact' }],
  messageTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
  schedule: { type: Date, required: true },
  frequency: { type: String, required: true },
  duration: { type: String, required: true },
  status: { type: String, default: 'pending' },
});

module.exports = mongoose.model('Campaign', campaignSchema);

const Campaign = require('../models/Campaign');

exports.createCampaign = async (req, res) => {
  try {
    const campaign = new Campaign(req.body);
    await campaign.save();
    res.status(201).send(campaign);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getCampaigns = async (req, res) => {
  try {
    const campaigns = await Campaign.find().populate('targetList messageTemplate');
    res.send(campaigns);
  } catch (error) {
    res.status(400).send(error);
  }
};

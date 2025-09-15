const Campaign = require('../models/Campaign');
const { sendMessage } = require('./messageService');

exports.startCampaign = async (campaignId) => {
  try {
    const campaign = await Campaign.findById(campaignId).populate('targetList messageTemplate');
    if (!campaign) {
      throw new Error('Campaign not found');
    }

    const messageContent = campaign.messageTemplate.content;
    for (const target of campaign.targetList) {
      await sendMessage(campaign.type, target, messageContent);
    }

    campaign.status = 'completed';
    await campaign.save();
  } catch (error) {
    console.error('Error starting campaign:', error);
  }
};

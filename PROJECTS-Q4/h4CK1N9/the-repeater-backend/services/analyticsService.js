const Campaign = require('../models/Campaign');

exports.getCampaignAnalytics = async () => {
  try {
    const campaigns = await Campaign.find().populate('targetList messageTemplate');
    const analytics = {
      totalMessagesSent: campaigns.reduce((sum, campaign) => sum + campaign.targetList.length, 0),
      responsesReceived: 0, // Implement response tracking
      uniqueTargets: new Set(campaigns.flatMap(campaign => campaign.targetList.map(target => target._id))).size,
    };
    return analytics;
  } catch (error) {
    console.error('Error getting campaign analytics:', error);
    return {};
  }
};

const express = require('express');
const { createCampaign, getCampaigns } = require('../controllers/campaignController');
const router = express.Router();

router.post('/', createCampaign);
router.get('/', getCampaigns);

module.exports = router;

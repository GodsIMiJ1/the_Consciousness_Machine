#!/bin/bash

# Define project name and directory
PROJECT_NAME="the-repeater-backend"
PROJECT_DIR="$PROJECT_NAME"

# Create project directory
mkdir "$PROJECT_DIR"
cd "$PROJECT_DIR"

# Initialize the project
npm init -y

# Install dependencies
npm install express mongoose bcryptjs jsonwebtoken dotenv

# Create project structure
mkdir models controllers routes services
touch server.js .env

# Populate models
cat << 'EOF' > models/Contact.js
const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('Contact', contactSchema);
EOF

cat << 'EOF' > models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  content: { type: String, required: true },
  category: { type: String, required: true },
});

module.exports = mongoose.model('Message', messageSchema);
EOF

cat << 'EOF' > models/Campaign.js
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
EOF

# Populate controllers
cat << 'EOF' > controllers/authController.js
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ email, password: hashedPassword });
    await user.save();
    res.status(201).send({ message: 'User registered successfully' });
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send({ message: 'Invalid credentials' });
    }
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.send({ token });
  } catch (error) {
    res.status(400).send(error);
  }
};
EOF

cat << 'EOF' > controllers/contactController.js
const Contact = require('../models/Contact');

exports.createContact = async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    res.status(201).send(contact);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getContacts = async (req, res) => {
  try {
    const contacts = await Contact.find();
    res.send(contacts);
  } catch (error) {
    res.status(400).send(error);
  }
};
EOF

cat << 'EOF' > controllers/messageController.js
const Message = require('../models/Message');

exports.createMessage = async (req, res) => {
  try {
    const message = new Message(req.body);
    await message.save();
    res.status(201).send(message);
  } catch (error) {
    res.status(400).send(error);
  }
};

exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.send(messages);
  } catch (error) {
    res.status(400).send(error);
  }
};
EOF

cat << 'EOF' > controllers/campaignController.js
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
EOF

# Populate routes
cat << 'EOF' > routes/authRoutes.js
const express = require('express');
const { register, login } = require('../controllers/authController');
const router = express.Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
EOF

cat << 'EOF' > routes/contactRoutes.js
const express = require('express');
const { createContact, getContacts } = require('../controllers/contactController');
const router = express.Router();

router.post('/', createContact);
router.get('/', getContacts);

module.exports = router;
EOF

cat << 'EOF' > routes/messageRoutes.js
const express = require('express');
const { createMessage, getMessages } = require('../controllers/messageController');
const router = express.Router();

router.post('/', createMessage);
router.get('/', getMessages);

module.exports = router;
EOF

cat << 'EOF' > routes/campaignRoutes.js
const express = require('express');
const { createCampaign, getCampaigns } = require('../controllers/campaignController');
const router = express.Router();

router.post('/', createCampaign);
router.get('/', getCampaigns);

module.exports = router;
EOF

# Populate services
cat << 'EOF' > services/messageService.js
const twilio = require('twilio');
const nodemailer = require('nodemailer');
const Message = require('../models/Message');

const client = twilio(process.env.TWILIO_SID, process.env.TWILIO_AUTH_TOKEN);

exports.sendMessage = async (type, target, messageContent) => {
  try {
    if (type === 'phone') {
      await client.messages.create({
        body: messageContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: target.phone,
      });
    } else if (type === 'text') {
      await client.messages.create({
        body: messageContent,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: target.phone,
      });
    } else if (type === 'email') {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: target.email,
        subject: 'Your Subject Here',
        text: messageContent,
      };
      await transporter.sendMail(mailOptions);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
};
EOF

cat << 'EOF' > services/schedulerService.js
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
EOF

cat << 'EOF' > services/analyticsService.js
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
EOF

# Populate server.js
cat << 'EOF' > server.js
const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const messageRoutes = require('./routes/messageRoutes');
const campaignRoutes = require('./routes/campaignRoutes');

dotenv.config();

const app = express();
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/campaigns', campaignRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(\`Server is running on port $\{PORT\}\`);
});
EOF

# Populate .env
cat << 'EOF' > .env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
TWILIO_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_pass
PORT=5000
EOF

echo "Project scaffold generated successfully!"

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

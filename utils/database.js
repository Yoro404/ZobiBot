const mongoose = require('mongoose');
const logger = require('./logger');

// Schéma Utilisateur
const userSchema = new mongoose.Schema({
  userId: { type: String, unique: true },
  guildId: String,
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  totalXp: { type: Number, default: 0 },
  voiceSessions: [{
    start: Date,
    end: Date
  }]
});

const User = mongoose.model('User', userSchema);

module.exports = {
  connect: async () => {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.log('✅ Connecté à la base de données');
  },

  getUser: async (userId, guildId) => {
    return User.findOneAndUpdate(
      { userId, guildId },
      { $setOnInsert: { xp: 0, level: 1 } },
      { new: true, upsert: true, lean: true }
    );
  },

  getTopUsers: async (guildId, limit = 10) => {
    return User.find({ guildId })
      .sort({ totalXp: -1 })
      .limit(limit)
      .lean();
  },

  startVoiceSession: async (userId) => {
    await User.updateOne(
      { userId },
      { $push: { voiceSessions: { start: new Date() } } }
    );
  },

  endVoiceSession: async (userId) => {
    const user = await User.findOne({ userId });
    const lastSession = user.voiceSessions[user.voiceSessions.length - 1];
    lastSession.end = new Date();
    await user.save();
    return {
      duration: (lastSession.end - lastSession.start) / 1000, // en secondes
      user
    };
  }
};
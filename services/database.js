import mongoose from 'mongoose';
import logger from './logger.js';

const userSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  guildId: { type: String, required: true },
  username: { type: String, default: 'Unknown' },
  xp: { type: Number, default: 0 },
  level: { type: Number, default: 1 },
  totalXp: { type: Number, default: 0 },
  lastMessage: { type: Date, default: Date.now },
  voiceSessions: [{
    start: { type: Date, default: Date.now },
    end: Date,
    duration: Number 
  }]
}, {
  timestamps: true
});
userSchema.index({ userId: 1, guildId: 1 }, { unique: true });
userSchema.index({ guildId: 1, totalXp: -1 });

const User = mongoose.model('User', userSchema);
const voiceSessions = new Map();

const db = {
  connect: async () => {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    logger.info('Connecté à MongoDB');
  },
  getUser: async (userId, guildId, username = 'Unknown') => {
    return User.findOneAndUpdate(
      { userId, guildId },
      { $setOnInsert: { username } },
      { new: true, upsert: true, lean: true }
    );
  },
  updateUser: async (userId, guildId, updateData) => {
    return User.findOneAndUpdate(
      { userId, guildId },
      { ...updateData, lastMessage: new Date() },
      { new: true, lean: true }
    );
  },
  getTopUsers: async (guildId, limit = 10) => {
    const users = await User.find({ guildId })
      .sort({ totalXp: -1 })
      .limit(limit)
      .select('userId username level totalXp')
      .lean();
    return users.map((user, i) => ({ ...user, rank: i + 1 }));
  },
  getUserWithRank: async (userId, guildId) => {
    const user = await User.findOne({ userId, guildId }).lean();
    if (!user) return null;
    const betterUsers = await User.countDocuments({ guildId, totalXp: { $gt: user.totalXp } });
    return { ...user, rank: betterUsers + 1 };
  },
  startVoiceSession: (userId) => {
    voiceSessions.set(userId, { start: new Date(), userId });
  },
  endVoiceSession: async (userId) => {
    const session = voiceSessions.get(userId);
    if (!session) return null;
    const endTime = new Date();
    const duration = Math.floor((endTime - session.start) / 1000);
    voiceSessions.delete(userId);
    if (duration > 30) {
      await User.updateOne(
        { userId },
        { $push: { voiceSessions: { start: session.start, end: endTime, duration } } }
      );
    }
    return { duration, userId, xpEarned: Math.floor(duration / 60) };
  },
  cleanupVoiceSessions: () => {
    const now = new Date();
    const maxDuration = 24 * 60 * 60 * 1000;
    for (const [userId, session] of voiceSessions.entries()) {
      if (now - session.start > maxDuration) voiceSessions.delete(userId);
    }
  },
  getGuildStats: async (guildId) => {
    const stats = await User.aggregate([
      { $match: { guildId } },
      {
        $group: {
          _id: null,
          totalUsers: { $sum: 1 },
          totalXp: { $sum: '$totalXp' },
          averageLevel: { $avg: '$level' },
          maxLevel: { $max: '$level' }
        }
      }
    ]);
    return stats[0] || { totalUsers: 0, totalXp: 0, averageLevel: 0, maxLevel: 0 };
  }
};

setInterval(() => db.cleanupVoiceSessions(), 60 * 60 * 1000);

export default db;

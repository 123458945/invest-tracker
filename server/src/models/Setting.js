import mongoose from 'mongoose';

const settingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  key: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  category: {
    type: String,
    default: 'general',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

settingSchema.index({ userId: 1, key: 1 }, { unique: true });

settingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Setting = mongoose.model('Setting', settingSchema);

export default Setting;

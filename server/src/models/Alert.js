import mongoose from 'mongoose';

const alertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stockCode: {
    type: String,
    required: [true, '股票代码不能为空'],
    trim: true,
  },
  stockName: {
    type: String,
    required: [true, '股票名称不能为空'],
    trim: true,
  },
  market: {
    type: String,
    enum: ['sh', 'sz', 'fund'],
    required: [true, '市场不能为空'],
  },
  alertType: {
    type: String,
    enum: [
      'price_above', 'price_below',
      'change_above', 'change_below',
      'ma5_above', 'ma5_below',
      'ma10_above', 'ma10_below',
      'ma20_above', 'ma20_below',
      'ma60_above', 'ma60_below',
    ],
    required: [true, '提醒类型不能为空'],
  },
  targetValue: {
    type: Number,
    default: 0,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  isTriggered: {
    type: Boolean,
    default: false,
  },
  triggeredAt: {
    type: Date,
    default: null,
  },
  lastCheckedAt: {
    type: Date,
    default: null,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [200, '备注最多200个字符'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

alertSchema.index({ userId: 1, isActive: 1 });
alertSchema.index({ stockCode: 1 });

alertSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Alert = mongoose.model('Alert', alertSchema);

export default Alert;

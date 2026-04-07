import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  stockCode: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  stockName: {
    type: String,
    required: true,
  },
  currentPrice: {
    type: Number,
    default: 0,
  },
  openPrice: {
    type: Number,
    default: 0,
  },
  highPrice: {
    type: Number,
    default: 0,
  },
  lowPrice: {
    type: Number,
    default: 0,
  },
  closePrice: {
    type: Number,
    default: 0,
  },
  changePercent: {
    type: Number,
    default: 0,
  },
  volume: {
    type: Number,
    default: 0,
  },
  turnover: {
    type: Number,
    default: 0,
  },
  ma5: {
    type: Number,
    default: 0,
  },
  ma10: {
    type: Number,
    default: 0,
  },
  ma20: {
    type: Number,
    default: 0,
  },
  ma60: {
    type: Number,
    default: 0,
  },
  lastFetchedAt: {
    type: Date,
    default: Date.now,
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

stockSchema.index({ stockCode: 1 });
stockSchema.index({ lastFetchedAt: 1 });

stockSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  next();
});

const Stock = mongoose.model('Stock', stockSchema);

export default Stock;

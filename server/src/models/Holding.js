import mongoose from 'mongoose';

const holdingSchema = new mongoose.Schema({
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
    trim: true,
    default: '',
  },
  market: {
    type: String,
    enum: ['sh', 'sz', 'fund'],
    required: [true, '市场不能为空'],
  },
  assetType: {
    type: String,
    enum: ['stock', 'fund'],
    default: 'stock',
  },
  quantity: {
    type: Number,
    required: [true, '持仓数量不能为空'],
    min: [0, '持仓数量不能为负数'],
    default: 0,
  },
  avgBuyPrice: {
    type: Number,
    required: [true, '平均成本不能为空'],
    min: [0, '平均成本不能为负数'],
    default: 0,
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  currentPrice: {
    type: Number,
    default: 0,
    min: [0, '当前价格不能为负数'],
  },
  realizedProfit: {
    type: Number,
    default: 0,
  },
  firstBuyDate: {
    type: Date,
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [500, '备注最多500个字符'],
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

holdingSchema.virtual('marketValue').get(function () {
  return this.quantity * this.currentPrice;
});

holdingSchema.virtual('costBasis').get(function () {
  return this.quantity * this.avgBuyPrice;
});

holdingSchema.virtual('unrealizedProfit').get(function () {
  return this.marketValue - this.costBasis;
});

holdingSchema.virtual('totalProfit').get(function () {
  return this.unrealizedProfit + this.realizedProfit;
});

holdingSchema.virtual('profitLossRate').get(function () {
  if (this.costBasis === 0) return 0;
  return ((this.marketValue - this.costBasis) / this.costBasis) * 100;
});

holdingSchema.set('toJSON', { virtuals: true });
holdingSchema.set('toObject', { virtuals: true });

holdingSchema.pre('save', function (next) {
  this.updatedAt = Date.now();
  this.totalCost = this.quantity * this.avgBuyPrice;
  next();
});

const Holding = mongoose.model('Holding', holdingSchema);

export default Holding;

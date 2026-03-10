import mongoose from 'mongoose';

const transactionSchema = new mongoose.Schema({
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
  type: {
    type: String,
    enum: ['buy', 'sell'],
    required: [true, '交易类型不能为空'],
  },
  quantity: {
    type: Number,
    required: [true, '交易数量不能为空'],
    min: [0, '交易数量不能为负数'],
  },
  price: {
    type: Number,
    required: [true, '交易价格不能为空'],
    min: [0, '交易价格不能为负数'],
  },
  amount: {
    type: Number,
    default: 0,
  },
  transactionDate: {
    type: Date,
    required: [true, '交易日期不能为空'],
  },
  realizedProfit: {
    type: Number,
    default: 0,
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
  deletedAt: {
    type: Date,
    default: null,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

transactionSchema.pre('save', function (next) {
  this.amount = this.quantity * this.price;
  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

export default Transaction;

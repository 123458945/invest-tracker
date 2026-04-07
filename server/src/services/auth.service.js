import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import User from '../models/User.js';

export const registerService = async (username, email, password) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new Error('该邮箱已被注册');
  }

  const user = await User.create({
    username,
    email,
    password,
  });

  const token = jwt.sign({ id: user._id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};

export const loginService = async (email, password) => {
  const user = await User.findOne({ email }).select('+password');
  if (!user) {
    throw new Error('邮箱或密码错误');
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    throw new Error('邮箱或密码错误');
  }

  const token = jwt.sign({ id: user._id }, jwtConfig.secret, {
    expiresIn: jwtConfig.expiresIn,
  });

  return {
    token,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
    },
  };
};

export const getMeService = async (userId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error('用户不存在');
  }

  return {
    id: user._id,
    username: user.username,
    email: user.email,
    createdAt: user.createdAt,
  };
};

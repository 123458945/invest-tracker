import { body } from 'express-validator';
import { registerService, loginService, getMeService } from '../services/auth.service.js';
import { successResponse, errorResponse } from '../utils/apiResponse.js';

export const register = [
  body('username')
    .trim()
    .notEmpty().withMessage('用户名不能为空')
    .isLength({ min: 2, max: 20 }).withMessage('用户名长度为2-20个字符'),
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('密码不能为空')
    .isLength({ min: 6 }).withMessage('密码至少6个字符'),

  async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const result = await registerService(username, email, password);
      return successResponse(res, result, '注册成功', 201);
    } catch (error) {
      return errorResponse(res, error.message, 400);
    }
  }
];

export const login = [
  body('email')
    .trim()
    .notEmpty().withMessage('邮箱不能为空')
    .isEmail().withMessage('请输入有效的邮箱地址')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('密码不能为空'),

  async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await loginService(email, password);
      return successResponse(res, result, '登录成功');
    } catch (error) {
      return errorResponse(res, error.message, 401);
    }
  }
];

export const getMe = async (req, res) => {
  try {
    const user = await getMeService(req.userId);
    return successResponse(res, user, '获取用户信息成功');
  } catch (error) {
    return errorResponse(res, error.message, 404);
  }
};

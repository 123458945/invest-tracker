import jwt from 'jsonwebtoken';
import jwtConfig from '../config/jwt.js';
import { errorResponse } from '../utils/apiResponse.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, jwtConfig.secret);
      req.userId = decoded.id;
      next();
    } catch (error) {
      return errorResponse(res, '无效的Token，请重新登录', 401);
    }
  }

  if (!token) {
    return errorResponse(res, '未授权，请登录', 401);
  }
};

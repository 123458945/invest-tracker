// utils/validate.js

/**
 * 验证邮箱格式
 */
function validateEmail(email) {
  if (!email || typeof email !== 'string') {
    return { valid: false, message: '邮箱不能为空' }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, message: '邮箱格式不正确' }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证手机号格式
 */
function validatePhone(phone) {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, message: '手机号不能为空' }
  }
  
  const phoneRegex = /^1[3-9]\d{9}$/
  if (!phoneRegex.test(phone)) {
    return { valid: false, message: '手机号格式不正确' }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证密码强度
 * @param {string} password 密码
 * @param {string} level 强度等级：low(6位以上)、medium(8位+数字+字母)、strong(8位+数字+字母+特殊字符)
 */
function validatePassword(password, level = 'medium') {
  if (!password || typeof password !== 'string') {
    return { valid: false, message: '密码不能为空' }
  }
  
  if (level === 'low') {
    if (password.length < 6) {
      return { valid: false, message: '密码至少需要6个字符' }
    }
  } else if (level === 'medium') {
    if (password.length < 8) {
      return { valid: false, message: '密码至少需要8个字符' }
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: '密码需要包含数字' }
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, message: '密码需要包含字母' }
    }
  } else if (level === 'strong') {
    if (password.length < 8) {
      return { valid: false, message: '密码至少需要8个字符' }
    }
    if (!/\d/.test(password)) {
      return { valid: false, message: '密码需要包含数字' }
    }
    if (!/[a-zA-Z]/.test(password)) {
      return { valid: false, message: '密码需要包含字母' }
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      return { valid: false, message: '密码需要包含特殊字符' }
    }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证股票代码格式
 */
function validateStockCode(code) {
  if (!code || typeof code !== 'string') {
    return { valid: false, message: '股票代码不能为空' }
  }
  
  // 移除可能的空格和后缀
  code = code.trim().split('.')[0]
  
  // 检查是否为6位数字
  if (!/^\d{6}$/.test(code)) {
    return { valid: false, message: '股票代码应为6位数字' }
  }
  
  // 检查市场代码
  if (code.startsWith('6')) {
    // 上海主板：600xxx, 601xxx, 603xxx
    if (!/^60[0-3]\d{3}$/.test(code)) {
      return { valid: false, message: '上海主板代码格式不正确' }
    }
  } else if (code.startsWith('0')) {
    // 深圳主板：000xxx, 001xxx, 002xxx, 003xxx
    if (!/^00[0-3]\d{3}$/.test(code)) {
      return { valid: false, message: '深圳主板代码格式不正确' }
    }
  } else if (code.startsWith('3')) {
    // 创业板：300xxx
    if (!/^30\d{4}$/.test(code)) {
      return { valid: false, message: '创业板代码格式不正确' }
    }
  } else {
    return { valid: false, message: '无法识别的股票代码' }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证金额范围
 */
function validateAmount(amount, min = 0, max = Infinity) {
  if (amount === null || amount === undefined || amount === '') {
    return { valid: false, message: '金额不能为空' }
  }
  
  const num = Number(amount)
  
  if (isNaN(num)) {
    return { valid: false, message: '金额格式不正确' }
  }
  
  if (num < min) {
    return { valid: false, message: `金额不能小于${min}` }
  }
  
  if (num > max) {
    return { valid: false, message: `金额不能大于${max}` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证数量
 */
function validateQuantity(quantity, min = 1) {
  if (quantity === null || quantity === undefined || quantity === '') {
    return { valid: false, message: '数量不能为空' }
  }
  
  const num = Number(quantity)
  
  if (isNaN(num)) {
    return { valid: false, message: '数量格式不正确' }
  }
  
  if (!Number.isInteger(num)) {
    return { valid: false, message: '数量必须为整数' }
  }
  
  if (num < min) {
    return { valid: false, message: `数量不能小于${min}` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证价格
 */
function validatePrice(price, min = 0.01) {
  if (price === null || price === undefined || price === '') {
    return { valid: false, message: '价格不能为空' }
  }
  
  const num = Number(price)
  
  if (isNaN(num)) {
    return { valid: false, message: '价格格式不正确' }
  }
  
  if (num < min) {
    return { valid: false, message: `价格不能小于${min}` }
  }
  
  // 检查小数位数（股票价格精确到分）
  const decimalPart = String(price).split('.')[1]
  if (decimalPart && decimalPart.length > 2) {
    return { valid: false, message: '价格最多保留2位小数' }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证用户名
 */
function validateUsername(username) {
  if (!username || typeof username !== 'string') {
    return { valid: false, message: '用户名不能为空' }
  }
  
  if (username.length < 3) {
    return { valid: false, message: '用户名至少需要3个字符' }
  }
  
  if (username.length > 20) {
    return { valid: false, message: '用户名不能超过20个字符' }
  }
  
  // 只允许字母、数字、下划线
  const usernameRegex = /^[a-zA-Z0-9_]+$/
  if (!usernameRegex.test(username)) {
    return { valid: false, message: '用户名只能包含字母、数字和下划线' }
  }
  
  return { valid: true, message: '' }
}

/**
 * 验证必填字段
 */
function validateRequired(value, fieldName = '此字段') {
  if (value === null || value === undefined || value === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  if (typeof value === 'string' && value.trim() === '') {
    return { valid: false, message: `${fieldName}不能为空` }
  }
  
  return { valid: true, message: '' }
}

/**
 * 批量验证表单
 * @param {Object} rules 验证规则
 * @param {Object} values 表单值
 * @returns {Object} 验证结果 { valid: boolean, errors: {} }
 */
function validateForm(rules, values) {
  const errors = {}
  let valid = true
  
  for (const field in rules) {
    const fieldRules = rules[field]
    const value = values[field]
    
    for (const rule of fieldRules) {
      let result = { valid: true, message: '' }
      
      switch (rule.type) {
        case 'required':
          result = validateRequired(value, rule.message || field)
          break
        case 'email':
          result = validateEmail(value)
          break
        case 'phone':
          result = validatePhone(value)
          break
        case 'password':
          result = validatePassword(value, rule.level || 'medium')
          break
        case 'stockCode':
          result = validateStockCode(value)
          break
        case 'amount':
          result = validateAmount(value, rule.min, rule.max)
          break
        case 'quantity':
          result = validateQuantity(value, rule.min)
          break
        case 'price':
          result = validatePrice(value, rule.min)
          break
        case 'username':
          result = validateUsername(value)
          break
        case 'custom':
          if (rule.validator) {
            result = rule.validator(value)
          }
          break
      }
      
      if (!result.valid) {
        errors[field] = result.message
        valid = false
        break
      }
    }
  }
  
  return { valid, errors }
}

module.exports = {
  validateEmail,
  validatePhone,
  validatePassword,
  validateStockCode,
  validateAmount,
  validateQuantity,
  validatePrice,
  validateUsername,
  validateRequired,
  validateForm
}

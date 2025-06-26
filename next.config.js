module.exports = {
  api: {
    // 增加API请求体大小限制
    bodyParser: {
      sizeLimit: '10mb'
    }
  },
  // 如果使用Redis，需要添加外部包
  experimental: {
    externalDir: true
  }
};
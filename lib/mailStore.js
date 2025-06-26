// 内存存储实现（生产环境建议使用Redis）
let mailStore = {
  // 存储结构: {[email]: {lastNotification: timestamp, count: number}}
};

// Redis存储实现
let redisClient = null;
if (process.env.MAIL_STORE_TYPE === 'redis') {
  const Redis = require('ioredis');
  redisClient = new Redis(process.env.REDIS_URL);
}

// 添加新邮件通知
export async function addNewMailNotification(recipient) {
  const now = Date.now();
  
  if (process.env.MAIL_STORE_TYPE === 'redis' && redisClient) {
    // 使用Redis存储
    await redisClient.hset(
      'mail:notifications', 
      recipient, 
      JSON.stringify({ lastNotification: now, count: 1 })
    );
  } else {
    // 使用内存存储
    if (!mailStore[recipient]) {
      mailStore[recipient] = { lastNotification: now, count: 1 };
    } else {
      mailStore[recipient].count += 1;
      mailStore[recipient].lastNotification = now;
    }
  }
  
  return true;
}

// 检查是否有新邮件
export async function hasNewMail(recipient) {
  if (process.env.MAIL_STORE_TYPE === 'redis' && redisClient) {
    const data = await redisClient.hget('mail:notifications', recipient);
    if (!data) return false;
    
    const notification = JSON.parse(data);
    return notification.count > 0;
  } else {
    return mailStore[recipient]?.count > 0 || false;
  }
}

// 重置通知状态
export async function resetMailNotification(recipient) {
  if (process.env.MAIL_STORE_TYPE === 'redis' && redisClient) {
    await redisClient.hset(
      'mail:notifications', 
      recipient, 
      JSON.stringify({ lastNotification: Date.now(), count: 0 })
    );
  } else {
    if (mailStore[recipient]) {
      mailStore[recipient].count = 0;
    }
  }
  
  return true;
}

// 清理旧记录（可选）
export async function cleanupOldRecords() {
  const now = Date.now();
  const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
  
  if (process.env.MAIL_STORE_TYPE === 'redis' && redisClient) {
    // Redis 有自动过期功能，这里不需要额外清理
  } else {
    for (const email in mailStore) {
      if (now - mailStore[email].lastNotification > maxAge) {
        delete mailStore[email];
      }
    }
  }
}

// 启动定时清理（如果使用内存存储）
if (process.env.MAIL_STORE_TYPE !== 'redis') {
  const interval = parseInt(process.env.CLEANUP_INTERVAL_MINUTES || '60', 10) * 60 * 1000;
  setInterval(cleanupOldRecords, interval);
}
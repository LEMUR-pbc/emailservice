import { hasNewMail, resetMailNotification } from '../../lib/mailStore';

export default async function handler(req, res) {
  // 只接受GET请求
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 从查询参数获取邮箱地址
  const email = req.query.email;
  if (!email) {
    return res.status(400).json({ error: 'Email parameter is required' });
  }

  try {
    // 检查是否有新邮件
    const hasNew = await hasNewMail(email.toLowerCase());
    
    // 重置通知状态（如果客户端要求）
    const reset = req.query.reset === 'true';
    if (hasNew && reset) {
      await resetMailNotification(email.toLowerCase());
    }

    res.status(200).json({ hasNewMail: hasNew });
  } catch (error) {
    console.error('Error checking mail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
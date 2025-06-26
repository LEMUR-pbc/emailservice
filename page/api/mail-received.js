import { addNewMailNotification } from '../../lib/mailStore';
import { parseEmailHeaders } from '../../lib/utils';

export default async function handler(req, res) {
  // 验证请求方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 验证认证令牌
  const authToken = req.headers['x-auth-token'];
  if (authToken !== process.env.MAILU_AUTH_TOKEN) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 获取原始邮件内容
  const rawEmail = req.body;
  if (!rawEmail || typeof rawEmail !== 'string') {
    return res.status(400).json({ error: 'Invalid email content' });
  }

  try {
    // 解析邮件头部（仅需收件人信息）
    const headers = parseEmailHeaders(rawEmail);
    
    // 提取收件人
    const recipients = headers.to.split(',').map(email => 
      email.trim().replace(/.*<([^>]+)>/, '$1').toLowerCase()
    );

    // 为每个收件人添加通知
    for (const recipient of recipients) {
      await addNewMailNotification(recipient);
      console.log(`New mail notification added for: ${recipient}`);
    }

    res.status(200).json({ success: true, recipients });
  } catch (error) {
    console.error('Error processing mail:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}
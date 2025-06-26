// 简单的邮件头解析器（仅提取必要字段）
export function parseEmailHeaders(rawEmail) {
  const headerEnd = rawEmail.indexOf('\n\n');
  const headerText = headerEnd !== -1 
    ? rawEmail.substring(0, headerEnd)
    : rawEmail;

  const headers = {};
  let currentKey = null;

  headerText.split('\n').forEach(line => {
    // 处理多行头字段
    if (line.startsWith(' ') || line.startsWith('\t')) {
      if (currentKey) {
        headers[currentKey] += ' ' + line.trim();
      }
      return;
    }

    // 处理新字段
    const colonIndex = line.indexOf(':');
    if (colonIndex !== -1) {
      currentKey = line.substring(0, colonIndex).trim().toLowerCase();
      const value = line.substring(colonIndex + 1).trim();
      
      if (currentKey) {
        headers[currentKey] = value;
      }
    }
  });

  return headers;
}
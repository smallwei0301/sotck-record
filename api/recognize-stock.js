// Node.js 語法，這段程式碼會在伺服器上執行

export default async function handler(req, res) {
  // 安全檢查：只允許 POST 方法
  if (req.method !== 'POST') {
    return res.status(405).json({ error: { message: '僅允許 POST 請求' } });
  }

  // 從伺服器的環境變數中安全地讀取 API 金鑰
  // 這個金鑰絕不會傳到用戶的瀏覽器
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.error('錯誤：找不到 GEMINI_API_KEY 環境變數');
    return res.status(500).json({ error: { message: '伺服器設定錯誤：API 金鑰未設定' } });
  }

  // 這是真正的 Google Gemini API 端點
  const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

  try {
    // 將前端傳來的請求主體 (req.body)，原封不動地轉發給 Google API
    const response = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    // 等待 Google API 的回應
    const data = await response.json();

    // 檢查 Google 是否回傳錯誤
    if (!response.ok || data.error) {
        console.error('Google API 錯誤:', data);
        // 將 Google 的錯誤狀態碼和訊息回傳給前端
        return res.status(response.status || 500).json(data);
    }

    // 將成功的結果回傳給前端
    res.status(200).json(data);

  } catch (error) {
    console.error('後端代理發生錯誤:', error);
    res.status(500).json({ error: { message: '伺服器內部錯誤' } });
  }
}

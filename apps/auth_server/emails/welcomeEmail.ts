/**
 * Welcome Email Template
 * Sent to users after successful account activation
 */
export const welcomeEmail = (userName: string) => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to LunarLens</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #f5f5f5;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    .header {
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      padding: 40px 20px;
      text-align: center;
      color: #ffffff;
    }
    .header h1 {
      margin: 0;
      font-size: 32px;
      font-weight: 700;
    }
    .content {
      padding: 40px 30px;
    }
    .greeting {
      font-size: 24px;
      color: #333333;
      margin-bottom: 20px;
    }
    .message {
      font-size: 16px;
      line-height: 1.6;
      color: #666666;
      margin-bottom: 30px;
    }
    .features {
      background-color: #f9fafb;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
    }
    .feature-item {
      display: flex;
      align-items: start;
      margin-bottom: 15px;
    }
    .feature-icon {
      background-color: #3b82f6;
      color: #ffffff;
      width: 32px;
      height: 32px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-right: 15px;
      flex-shrink: 0;
      font-weight: bold;
    }
    .feature-text {
      flex: 1;
      color: #333333;
      font-size: 14px;
    }
    .button {
      display: inline-block;
      background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 6px;
      font-weight: 600;
      margin: 20px 0;
    }
    .footer {
      background-color: #f9fafb;
      padding: 30px;
      text-align: center;
      color: #999999;
      font-size: 14px;
      border-top: 1px solid #e5e7eb;
    }
    .social-links {
      margin: 20px 0;
    }
    .social-link {
      display: inline-block;
      margin: 0 10px;
      color: #3b82f6;
      text-decoration: none;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🚀 Welcome to LunarLens!</h1>
    </div>
    
    <div class="content">
      <div class="greeting">Hi ${userName}!</div>
      
      <div class="message">
        <p>Thank you for joining LunarLens! Your account is now active and ready to explore lunar XRF data.</p>
        <p>We're excited to have you on board. LunarLens is your comprehensive platform for analyzing lunar X-ray Fluorescence (XRF) spectroscopy data from the Chandrayaan-2 CLASS instrument.</p>
      </div>

      <div class="features">
        <div class="feature-item">
          <div class="feature-icon">🌙</div>
          <div class="feature-text">
            <strong>3D Lunar Globe Visualization</strong><br>
            Interactive 3D globe showing data collection points and lunar surface features
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📊</div>
          <div class="feature-text">
            <strong>Spectral Analysis</strong><br>
            Automated peak detection, element identification, and flux calculations
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">🔬</div>
          <div class="feature-text">
            <strong>XRF Data Processing</strong><br>
            Process FITS files from Chandrayaan-2 CLASS instrument with advanced algorithms
          </div>
        </div>
        <div class="feature-item">
          <div class="feature-icon">📈</div>
          <div class="feature-text">
            <strong>Elemental Composition Mapping</strong><br>
            Generate detailed maps of lunar surface elemental composition and ratios
          </div>
        </div>
      </div>

      <center>
        <a href="${process.env.CLIENT_URL}/dashboard" class="button">
          Go to Dashboard →
        </a>
      </center>

      <div class="message" style="margin-top: 30px;">
        <p><strong>Need help getting started?</strong></p>
        <ul style="color: #666666;">
          <li>Check out our <a href="${process.env.CLIENT_URL}/docs" style="color: #667eea;">documentation</a></li>
          <li>Watch our <a href="${process.env.CLIENT_URL}/tutorials" style="color: #667eea;">video tutorials</a></li>
          <li>Join our <a href="${process.env.CLIENT_URL}/community" style="color: #667eea;">community forum</a></li>
        </ul>
      </div>
    </div>

    <div class="footer">
      <div class="social-links">
        <a href="#" class="social-link">Twitter</a>
        <a href="#" class="social-link">Discord</a>
        <a href="#" class="social-link">GitHub</a>
      </div>
      <p>© ${new Date().getFullYear()} LunarLens. All rights reserved.</p>
      <p style="font-size: 12px; margin-top: 10px;">
        You're receiving this email because you signed up for LunarLens.
      </p>
    </div>
  </div>
</body>
</html>
  `;
};

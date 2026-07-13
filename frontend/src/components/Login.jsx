import { useState, useEffect } from 'react';

export default function Login({ onLogin, isMobile }) {
  const [username, setUsername] = useState('MangaTranslator');
  const [password, setPassword] = useState('password123');
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) {
      alert('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน');
      return;
    }

    setIsLoading(true);
    
    // Simulate connection workflow to give it a realistic admin/user feel in Thai
    const stages = isAdminMode ? [
      { text: 'กำลังตรวจสอบสิทธิ์ผู้ดูแลระบบ...', delay: 200 },
      { text: 'กำลังเชื่อมต่อฐานข้อมูลระบบควบคุม...', delay: 600 },
      { text: 'โหลดสถิติเซิร์ฟเวอร์ Telemetry...', delay: 1000 },
      { text: 'กำลังเตรียมระบบจัดการคำแปล...', delay: 1400 },
      { text: 'ล็อกอินแอดมินสำเร็จ! กำลังเข้าสู่ระบบ...', delay: 1800 }
    ] : [
      { text: 'กำลังเชื่อมต่อเซิร์ฟเวอร์หลัก...', delay: 200 },
      { text: 'ตรวจสอบบัญชีผู้ใช้งาน...', delay: 600 },
      { text: 'ซิงค์ข้อมูลมังงะและรายการโปรด...', delay: 1000 },
      { text: 'กำลังโหลดประวัติการแปล...', delay: 1400 },
      { text: 'ล็อกอินสำเร็จ! ยินดีต้อนรับกลับ...', delay: 1800 }
    ];

    stages.forEach((stage) => {
      setTimeout(() => {
        setStatusMsg(stage.text);
        if (stage.text.includes('สำเร็จ')) {
          setTimeout(() => {
            onLogin({
              serverUrl: 'http://localhost:8000/api/v1',
              token: 'ath_live_mock_token',
              role: isAdminMode ? 'admin' : 'user',
              username: username
            });
            setIsLoading(false);
          }, 400);
        }
      }, stage.delay);
    });
  };

  return (
    <div className="login-container flex-center" style={styles.container}>
      <div className="glass-panel" style={{
        ...styles.card,
        borderColor: isAdminMode ? 'rgba(157, 78, 221, 0.4)' : 'rgba(0, 245, 212, 0.3)',
        boxShadow: isAdminMode ? '0 0 25px rgba(157, 78, 221, 0.2)' : '0 0 25px rgba(0, 245, 212, 0.15)',
        ...(isMobile ? {
          padding: '24px 16px',
          margin: '0 8px',
        } : {})
      }}>
        <div style={styles.header}>
          <div style={{
            ...styles.logoBadge,
            ...(isAdminMode ? {
              background: 'rgba(157, 78, 221, 0.15)',
              border: '1px solid rgba(157, 78, 221, 0.3)',
              color: '#d8b4fe'
            } : {})
          }}>
            <span style={styles.logoIcon}>✦</span>
            <span>{isAdminMode ? 'ส่วนควบคุมระบบหลังบ้าน' : 'MangaDex OCR-LLM Pipeline'}</span>
          </div>
          <h2 style={{
            ...styles.title,
            background: isAdminMode ? 'linear-gradient(to right, #ffffff, var(--accent-purple))' : 'linear-gradient(to right, #ffffff, var(--accent-cyan))',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            ...(isMobile ? {
              fontSize: '1.6rem',
            } : {})
          }}>{isAdminMode ? 'เข้าสู่ระบบแอดมิน' : 'เข้าสู่ระบบสมาชิก'}</h2>
          <p style={styles.subtitle}>
            {isAdminMode 
              ? 'กรอกรหัสผู้ดูแลระบบเพื่อเข้าจัดการตั้งค่าโมเดล AI, ตรวจสอบภาระงาน GPU และประมวลผลประวัติคำแปลมังงะ'
              : 'ล็อกอินเพื่อบันทึกมังงะเก็บไว้ในชั้นหนังสือส่วนตัว ร่วมเสนอแก้ไขบทแปลภาษาไทย และอัปเวลเลเวลนักแปล'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          <div className="input-group">
            <label htmlFor="username">ชื่อผู้ใช้ (Username)</label>
            <input
              id="username"
              type="text"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="กรอกชื่อผู้ใช้ของคุณ"
              required
              disabled={isLoading}
            />
          </div>

          <div className="input-group">
            <label htmlFor="password">รหัสผ่าน (Password)</label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="กรอกรหัสผ่านของคุณ"
              required
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            style={{
              ...styles.btn,
              background: isAdminMode ? 'linear-gradient(135deg, var(--accent-purple), #7b2cbf)' : 'linear-gradient(135deg, var(--accent-cyan), #00bbf9)',
              color: isAdminMode ? 'white' : 'var(--text-dark)',
              boxShadow: isAdminMode ? '0 4px 15px rgba(157, 78, 221, 0.3)' : '0 4px 15px rgba(0, 245, 212, 0.2)'
            }}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="flex-center" style={{ gap: '8px' }}>
                <span className="loading-spinner" style={styles.spinner}></span>
                กำลังเข้าสู่ระบบ...
              </span>
            ) : (
              isAdminMode ? 'เข้าสู่ระบบแอดมิน' : 'เข้าสู่ระบบ'
            )}
          </button>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <button
              type="button"
              disabled={isLoading}
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setUsername(isAdminMode ? 'MangaTranslator' : 'admin');
                setPassword('password123');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
                fontSize: '0.8rem',
                cursor: 'pointer',
                transition: 'var(--transition-fast)',
              }}
            >
              {isAdminMode ? '← กลับไปเข้าสู่ระบบผู้ใช้ทั่วไป' : 'admin login'}
            </button>
          </div>
        </form>

        {isLoading && (
          <div style={styles.statusBox} className="animate-fade-in">
            <div style={styles.terminalCursor}>&gt;</div>
            <div style={styles.statusText}>{statusMsg}</div>
          </div>
        )}

        <div style={{
          ...styles.footer,
          ...(isMobile ? {
            flexDirection: 'column',
            alignItems: 'center',
            gap: '8px',
          } : {})
        }}>
          <span>Vite + React 19 Frontend Prototype</span>
          <span style={{ color: 'var(--accent-cyan)' }}>● Connection Sandbox Mode</span>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '24px',
    boxSizing: 'border-box',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    width: '100%',
    maxWidth: '480px',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    background: 'rgba(13, 17, 39, 0.85)',
    border: '1px solid rgba(157, 78, 221, 0.25)',
  },
  header: {
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  logoBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '4px 10px',
    background: 'rgba(0, 245, 212, 0.1)',
    border: '1px solid rgba(0, 245, 212, 0.2)',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: 'var(--accent-cyan)',
    fontWeight: '700',
    letterSpacing: '0.05em',
    textTransform: 'uppercase',
  },
  logoIcon: {
    fontSize: '0.9rem',
    animation: 'pulse 1.5s infinite',
  },
  title: {
    fontSize: '2rem',
    fontWeight: '800',
    background: 'linear-gradient(to right, #ffffff, var(--accent-purple))',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    letterSpacing: '-0.02em',
  },
  subtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.4',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  select: {
    appearance: 'none',
    background: 'var(--bg-input) url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%2394a3b8\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e") no-repeat right 12px center/18px',
  },
  helpText: {
    display: 'block',
    marginTop: '4px',
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  btn: {
    marginTop: '8px',
    width: '100%',
  },
  statusBox: {
    marginTop: '8px',
    padding: '12px',
    background: 'rgba(0, 0, 0, 0.4)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    display: 'flex',
    gap: '8px',
    alignItems: 'center',
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    color: 'var(--accent-cyan)',
  },
  terminalCursor: {
    animation: 'pulse 1s infinite',
    fontWeight: 'bold',
  },
  statusText: {
    flex: 1,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  spinner: {
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255, 255, 255, 0.2)',
    borderTopColor: 'white',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  footer: {
    marginTop: '8px',
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    borderTop: '1px solid rgba(255, 255, 255, 0.05)',
    paddingTop: '16px',
  },
};

import React from 'react';

export default function Leaderboard({ leaderboard, user, isMobile }) {
  // Sort leaderboard by points descending just to ensure it's correct
  const sortedLeaderboard = [...leaderboard].sort((a, b) => b.points - a.points);

  // Total community stats helper
  const totalEdits = sortedLeaderboard.reduce((acc, cur) => acc + cur.approvedCount, 0);
  const totalPoints = sortedLeaderboard.reduce((acc, cur) => acc + cur.points, 0);

  return (
    <div className="container animate-fade-in" style={styles.container}>
      {/* Title & Introduction */}
      <div style={styles.header}>
        <div style={styles.badgeWrapper}>
          <span className="badge badge-cyan" style={{ fontSize: '0.8rem' }}>🏆 Community Leaderboard</span>
        </div>
        <h1 style={styles.title}>ทำเนียบผู้มีส่วนร่วมแปลการ์ตูน</h1>
        <p style={styles.subtitle}>
          อันดับนักแปลคอมมูนิตี้ที่ช่วยแก้ไขและขัดเกลาบทแปลภาษาไทยให้สละสลวยขึ้น ทุกๆ การอนุมัติจะเพิ่มแต้มและยกระดับตำแหน่งของคุณ!
        </p>
      </div>

      {/* Community Summary Widgets */}
      <div style={{
        ...styles.statsRow,
        ...(isMobile ? { flexDirection: 'column', gap: '12px' } : {})
      }}>
        <div style={{ ...styles.statCard, borderLeft: '4px solid var(--accent-cyan)' }} className="glass-panel accent-glow-cyan">
          <span style={styles.statLabel}>ยอดแก้ไขสะสมทั้งหมด</span>
          <span style={styles.statVal}>{totalEdits} ครั้ง</span>
          <span style={styles.statSub}>อัปเดตแบบเรียลไทม์</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid var(--accent-purple)' }} className="glass-panel accent-glow-purple">
          <span style={styles.statLabel}>คะแนนสะสมรวมของบอร์ด</span>
          <span style={styles.statVal}>{totalPoints} แต้ม</span>
          <span style={styles.statSub}>1 อนุมัติ = 10 แต้ม</span>
        </div>
        <div style={{ ...styles.statCard, borderLeft: '4px solid var(--accent-orange)' }} className="glass-panel">
          <span style={styles.statLabel}>ผู้มีส่วนร่วมใช้งาน</span>
          <span style={styles.statVal}>{sortedLeaderboard.length} คน</span>
          <span style={styles.statSub}>จากสมาชิกระดับประเทศ</span>
        </div>
      </div>

      <div style={{
        ...styles.contentGrid,
        ...(isMobile ? { gridTemplateColumns: '1fr', gap: '20px' } : {})
      }}>
        {/* Leaderboard Table Column */}
        <div style={styles.tableCard} className="glass-panel">
          <div style={styles.tableHeaderSection}>
            <h3 style={styles.tableTitle}>อันดับผู้มีผลงานสูงสุด</h3>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>อิงตามคะแนนผลงานการแปลที่ได้รับการอนุมัติ</span>
          </div>

          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableHeaderRow}>
                  <th style={{ ...styles.th, width: isMobile ? '50px' : '80px', textAlign: 'center', ...(isMobile ? { padding: '10px 6px', fontSize: '0.75rem' } : {}) }}>อันดับ</th>
                  <th style={{ ...styles.th, textAlign: 'left', ...(isMobile ? { padding: '10px 6px', fontSize: '0.75rem' } : {}) }}>ผู้ใช้คอมมูนิตี้</th>
                  <th style={{ ...styles.th, textAlign: 'center', ...(isMobile ? { padding: '10px 6px', fontSize: '0.75rem' } : {}) }}>ระดับฉายา</th>
                  <th style={{ ...styles.th, textAlign: 'center', ...(isMobile ? { padding: '10px 6px', fontSize: '0.75rem' } : {}) }}>อนุมัติแล้ว</th>
                  <th style={{ ...styles.th, textAlign: 'right', ...(isMobile ? { padding: '10px 6px', fontSize: '0.75rem' } : {}) }}>คะแนนสะสม</th>
                </tr>
              </thead>
              <tbody>
                {sortedLeaderboard.map((member, idx) => {
                  const rankNum = idx + 1;
                  const isCurrentUser = user && member.username.includes(user.username.replace(' #412', ''));
                  
                  // Medal/Rank Badge styles
                  let rankDisplay = rankNum;
                  if (rankNum === 1) rankDisplay = '🥇';
                  else if (rankNum === 2) rankDisplay = '🥈';
                  else if (rankNum === 3) rankDisplay = '🥉';

                  return (
                    <tr 
                      key={member.username} 
                      style={{
                        ...styles.tr,
                        backgroundColor: isCurrentUser ? 'rgba(0, 245, 212, 0.04)' : 'transparent',
                        borderLeft: isCurrentUser ? '3px solid var(--accent-cyan)' : '3px solid transparent',
                      }}
                    >
                      <td style={{ 
                        ...styles.td, 
                        textAlign: 'center', 
                        fontWeight: '800', 
                        fontSize: rankNum <= 3 ? '1.4rem' : '1rem',
                        ...(isMobile ? { padding: '10px 6px', fontSize: rankNum <= 3 ? '1.1rem' : '0.85rem' } : {})
                      }}>
                        {rankDisplay}
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        fontWeight: '700', 
                        textAlign: 'left',
                        ...(isMobile ? { padding: '10px 6px', fontSize: '0.85rem' } : {})
                      }}>
                        <div style={styles.userColumn}>
                          <span style={{ color: isCurrentUser ? 'var(--accent-cyan)' : '#fff' }}>
                            {member.username} {isCurrentUser && ' (คุณ)'}
                          </span>
                        </div>
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        textAlign: 'center',
                        ...(isMobile ? { padding: '10px 6px', fontSize: '0.75rem' } : {})
                      }}>
                        <span 
                          className="badge" 
                          style={getLevelBadgeStyle(member.level)}
                        >
                          {member.level === 'Grandmaster' ? 'เทพแห่งการแปล' : member.level === 'Master' ? 'ปรมาจารย์เกลาภาษา' : member.level === 'Expert' ? 'นักแปลดีเด่น' : member.level === 'Contributor' ? 'ผู้ช่วยขัดเกลาภาษา' : 'นักอ่านฝึกหัด'}
                        </span>
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        textAlign: 'center', 
                        color: 'var(--text-main)', 
                        fontWeight: '600',
                        ...(isMobile ? { padding: '10px 6px', fontSize: '0.85rem' } : {})
                      }}>
                        {member.approvedCount}
                      </td>
                      <td style={{ 
                        ...styles.td, 
                        textAlign: 'right', 
                        color: 'var(--accent-cyan)', 
                        fontWeight: '800',
                        ...(isMobile ? { padding: '10px 6px', fontSize: '0.85rem' } : {})
                      }}>
                        {member.points} แต้ม
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info Column */}
        <div style={styles.infoCol}>
          <div style={styles.badgeShowcaseCard} className="glass-panel accent-glow-purple">
            <h3 style={styles.infoTitle}>🎖️ ระดับสมาชิกผู้ร่วมพัฒนาคำแปล (Tiers)</h3>
            <div style={styles.badgeGrid}>
              <div style={styles.badgeInfoRow}>
                <span className="badge" style={getLevelBadgeStyle('Grandmaster')}>เทพแห่งการแปล</span>
                <span style={styles.badgeInfoText}>มีแต้มสะสม 1,000 คะแนนขึ้นไป</span>
              </div>
              <div style={styles.badgeInfoRow}>
                <span className="badge" style={getLevelBadgeStyle('Master')}>ปรมาจารย์เกลาภาษา</span>
                <span style={styles.badgeInfoText}>มีแต้มสะสม 800 - 999 คะแนน</span>
              </div>
              <div style={styles.badgeInfoRow}>
                <span className="badge" style={getLevelBadgeStyle('Expert')}>นักแปลดีเด่น</span>
                <span style={styles.badgeInfoText}>มีแต้มสะสม 500 - 799 คะแนน</span>
              </div>
              <div style={styles.badgeInfoRow}>
                <span className="badge" style={getLevelBadgeStyle('Contributor')}>ผู้ช่วยขัดเกลาภาษา</span>
                <span style={styles.badgeInfoText}>มีแต้มสะสม 100 - 499 คะแนน</span>
              </div>
              <div style={styles.badgeInfoRow}>
                <span className="badge" style={getLevelBadgeStyle('Novice')}>นักอ่านฝึกหัด</span>
                <span style={styles.badgeInfoText}>แต้มสะสมต่ำกว่า 100 คะแนน</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper to determine Level Badge styles
function getLevelBadgeStyle(level) {
  switch (level) {
    case 'Grandmaster':
      return { background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.4)', fontWeight: '800' };
    case 'Master':
      return { background: 'rgba(245, 158, 11, 0.15)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.4)', fontWeight: '700' };
    case 'Expert':
      return { background: 'rgba(157, 78, 221, 0.15)', color: '#d8b4fe', border: '1px solid rgba(157, 78, 221, 0.4)', fontWeight: '700' };
    case 'Contributor':
      return { background: 'rgba(59, 130, 246, 0.15)', color: '#60a5fa', border: '1px solid rgba(59, 130, 246, 0.4)', fontWeight: '600' };
    case 'Novice':
    default:
      return { background: 'rgba(148, 163, 184, 0.15)', color: '#cbd5e1', border: '1px solid rgba(148, 163, 184, 0.4)', fontWeight: '500' };
  }
}

const styles = {
  container: {
    paddingTop: '20px',
    paddingBottom: '60px',
    textAlign: 'left',
  },
  header: {
    marginBottom: '32px',
  },
  badgeWrapper: {
    marginBottom: '8px',
  },
  title: {
    fontSize: '2rem',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
    maxWidth: '800px',
    lineHeight: '1.5',
  },
  statsRow: {
    display: 'flex',
    gap: '24px',
    marginBottom: '40px',
    flexWrap: 'wrap',
  },
  statCard: {
    flex: 1,
    minWidth: '220px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    background: 'var(--bg-card)',
  },
  statLabel: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statVal: {
    fontSize: '1.8rem',
    fontWeight: '800',
    color: '#fff',
  },
  statSub: {
    fontSize: '0.7rem',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  contentGrid: {
    display: 'grid',
    gridTemplateColumns: '1.4fr 1fr',
    gap: '32px',
    alignItems: 'start',
  },
  tableCard: {
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  tableHeaderSection: {
    marginBottom: '20px',
  },
  tableTitle: {
    fontSize: '1.25rem',
    color: '#fff',
    marginBottom: '4px',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    borderBottom: '2px solid rgba(255,255,255,0.08)',
  },
  th: {
    padding: '12px 16px',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  tr: {
    borderBottom: '1px solid rgba(255,255,255,0.05)',
    transition: 'background-color 0.2s',
  },
  td: {
    padding: '16px',
    fontSize: '0.9rem',
    verticalAlign: 'middle',
  },
  userColumn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  // Info section
  infoCol: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  infoCard: {
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  infoTitle: {
    fontSize: '1.15rem',
    color: '#fff',
    marginBottom: '16px',
  },
  rulesList: {
    listStyleType: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  ruleItem: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    fontSize: '0.85rem',
    lineHeight: '1.4',
  },
  badgeShowcaseCard: {
    padding: '24px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  badgeGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  badgeInfoRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 12px',
    background: 'rgba(255,255,255,0.02)',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.03)',
  },
  badgeInfoText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    textAlign: 'right',
  },
};

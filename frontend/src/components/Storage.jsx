import { useState, useEffect } from 'react';

const PIPELINE_STEPS = [
  { id: 'downloading', label: 'ดาวน์โหลด', icon: '📥' },
  { id: 'ocr', label: 'OCR หาคำ', icon: '🔍' },
  { id: 'cleaning', label: 'คลีนรูปภาพ', icon: '🧹' },
  { id: 'translating', label: 'AI แปลไทย', icon: '🤖' },
  { id: 'typesetting', label: 'จัดเรียงคำ', icon: '✏️' }
];

const getActiveStepIndex = (status) => {
  if (status === 'completed') return 5;
  if (status === 'typesetting') return 4;
  if (status === 'translating') return 3;
  if (status === 'cleaning') return 2;
  if (status === 'ocr') return 1;
  if (status === 'downloading') return 0;
  return -1;
};

export default function Storage({ bookmarks, onToggleBookmark, downloads, onCancelDownload, onViewChapter, onOpenMangaDetails, isMobile }) {
  const [activeTab, setActiveTab] = useState('library');
  const [expandedLogJobId, setExpandedLogJobId] = useState(null);

  // Generate simulated console logs based on current progress/status of a job
  const getSimulatedLogs = (job) => {
    const logs = [];
    const ch = job.chapter;
    
    logs.push(`[ระบบ] [${new Date().toLocaleTimeString()}] กำลังจำลองเริ่มต้นขั้นตอนแปลภาษาสำหรับ ${job.mangaTitle} - ตอนที่ ${ch}`);
    logs.push(`[ระบบ] ตรวจสอบความพร้อมเซิร์ฟเวอร์หลัก: เชื่อมต่อสำเร็จ (200)`);
    
    if (job.progress > 5) {
      logs.push(`[ดาวน์โหลด] กำลังดึงรูปภาพจากหน้า MangaDex...`);
    }
    if (job.progress >= 20) {
      logs.push(`[ดาวน์โหลด] บันทึกรูปภาพมังงะ ${job.pages || 16} หน้าลงพื้นที่หน่วยความจำจำลองชั่วคราว`);
      logs.push(`[ดาวน์โหลด] ดาวน์โหลดหน้าภาพเรียบร้อย กำลังส่งต่อประมวลผลโมเดล OCR`);
    }
    if (job.progress >= 25) {
      logs.push(`[OCR] กำลังวิเคราะห์หาตำแหน่งกรอบคำพูดมังงะ (YOLOv8 Layout-Detector)...`);
    }
    if (job.progress >= 40) {
      logs.push(`[OCR] ตรวจพบพื้นที่ข้อความคำพูดทั้งหมด ${Math.floor((job.pages || 16) * 2.5)} บอลลูน`);
      logs.push(`[OCR] กำลังวิเคราะห์และถอดตัวอักษรภาษาญี่ปุ่นออกจากบอลลูนคำพูด (Tesseract OCR)...`);
      logs.push(`[OCR] ความแม่นยำในการถอดตัวอักษรญี่ปุ่น: 98.4%`);
      logs.push(`[OCR] เสร็จสิ้นขั้นตอน OCR: สร้างตำแหน่งทับถมสี (Inpaint Mask) เรียบร้อย`);
    }
    if (job.progress >= 45) {
      logs.push(`[คลีนภาพ] กำลังเริ่มรันโมเดลลบอักษรหลังการตรวจหา (LaMa Inpainting)...`);
    }
    if (job.progress >= 60) {
      logs.push(`[คลีนภาพ] กำลังลบตัวอักษรญี่ปุ่นต้นฉบับและฟื้นฟูพื้นหลังของภาพมังงะ...`);
      logs.push(`[คลีนภาพ] ลบเลเยอร์ข้อความเดิมออกทั้งหมด ${Math.floor((job.pages || 16) * 2.5)} บอลลูน ได้รับภาพเปล่าเรียบร้อย`);
    }
    if (job.progress >= 65) {
      logs.push(`[AI แปลภาษา] กำลังรันโมเดลภาษา AI แปลบทสนทนา (Gemini 1.5 Flash)...`);
      logs.push(`[AI แปลภาษา] กำหนดบริบทเฉพาะ ชื่อตัวละคร และแนวทางการปรับสำนวน...`);
    }
    if (job.progress >= 80) {
      logs.push(`[AI แปลภาษา] กำลังประมวลผลข้อความภาษาญี่ปุ่นเป็นภาษาไทย...`);
      logs.push(`[AI แปลภาษา] แปลบทสนทนาเสร็จสิ้น ความมั่นใจในการประมวลผล: 96.7%`);
      logs.push(`[AI แปลภาษา] ตัวอย่างคำแปล: "何だと？！" -> "เจ้าว่ายังไงนะ?!" (ปรับสำนวนให้เข้ากับท้องเรื่องแล้ว)`);
    }
    if (job.progress >= 85) {
      logs.push(`[จัดช่องไฟ] กำลังจัดเรียงบทแปลภาษาไทยลงในบอลลูนคำพูด...`);
      logs.push(`[จัดช่องไฟ] เลือกใช้ฟอนต์ภาษาไทย: MangaHub Regular ปรับลดขนาดคำอัตโนมัติ...`);
    }
    if (job.progress >= 95) {
      logs.push(`[ประมวลผลไฟล์] กำลังซ้อนข้อความแปลไทยลงบนภาพมังงะ...`);
      logs.push(`[ประมวลผลไฟล์] กำลังบีบอัดไฟล์ภาพผลลัพธ์เป็นแพ็คเกจให้อ่าน...`);
    }
    if (job.progress === 100) {
      logs.push(`[สำเร็จ] การแปลภาษา AI และรัน Pipeline ตอนนี้สำเร็จครบถ้วน!`);
      logs.push(`[สำเร็จ] ขนาดไฟล์: ${(2.4 + Math.random()).toFixed(2)} MB พร้อมให้คุณเปิดอ่านแล้ว`);
    } else {
      logs.push(`[กำลังทำงาน] อยู่ระหว่างประมวลผล... ขั้นตอนปัจจุบัน: ${job.status.toUpperCase()}`);
    }

    return logs;
  };

  const toggleLogExpand = (jobId) => {
    if (expandedLogJobId === jobId) {
      setExpandedLogJobId(null);
    } else {
      setExpandedLogJobId(jobId);
    }
  };

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ชั้นหนังสือมังงะของฉัน</h1>
        <p style={styles.subtitle}>จัดการรายการมังงะที่ชื่นชอบ และตรวจสอบคิวประมวลผลการแปลด้วยโมเดล AI</p>
      </div>

      {/* Tabs */}
      <div style={{
        ...styles.tabsContainer,
        ...(isMobile ? { gap: '12px', justifyContent: 'center' } : {})
      }}>
        <button
          style={{
            ...styles.tabBtn,
            color: activeTab === 'library' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottomColor: activeTab === 'library' ? 'var(--accent-cyan)' : 'transparent',
            ...(isMobile ? { fontSize: '0.85rem', padding: '10px 2px' } : {})
          }}
          onClick={() => setActiveTab('library')}
        >
          ❤️ ชั้นหนังสือมังงะ ({bookmarks.length})
        </button>
        <button
          style={{
            ...styles.tabBtn,
            color: activeTab === 'workspace' ? 'var(--accent-cyan)' : 'var(--text-muted)',
            borderBottomColor: activeTab === 'workspace' ? 'var(--accent-cyan)' : 'transparent',
            ...(isMobile ? { fontSize: '0.85rem', padding: '10px 2px' } : {})
          }}
          onClick={() => setActiveTab('workspace')}
        >
          {isMobile ? '📥 คิวแปล' : '📥 คิวแปลและดาวน์โหลด'} ({downloads.length})
        </button>
      </div>

      {/* LIBRARY TAB */}
      {activeTab === 'library' && (
        <div style={styles.content}>
          {bookmarks.length === 0 ? (
            <div style={styles.emptyCard} className="glass-panel">
              <span style={{ fontSize: '3rem' }}>📁</span>
              <h3>ชั้นหนังสือมังงะของคุณว่างเปล่า</h3>
              <p>กลับไปที่หน้าแดชบอร์ดเพื่อค้นหามังงะและบันทึกเก็บไว้ในรายการโปรด</p>
            </div>
          ) : (
            <div className="manga-grid">
              {bookmarks.map((manga) => (
                <div key={manga.id} className="glass-panel" style={styles.mangaCard}>
                  <div style={styles.coverWrapper}>
                    <img src={manga.coverUrl} alt={manga.title} style={styles.cover} />
                    <button
                      style={styles.removeBookmarkBtn}
                      onClick={() => onToggleBookmark(manga)}
                      title="ลบออกจากคลัง"
                    >
                      ✕
                    </button>
                  </div>
                  <div style={styles.mangaInfo}>
                    <h3 style={styles.mangaTitle}>{manga.title}</h3>
                    {manga.japaneseTitle && <p style={styles.mangaJapanese}>{manga.japaneseTitle}</p>}
                    <div style={styles.tagsContainer}>
                      {manga.tags.slice(0, 2).map((t) => (
                        <span key={t} style={styles.tag}>{t}</span>
                      ))}
                    </div>
                    <button
                      className="btn btn-primary"
                      style={styles.mangaActionBtn}
                      onClick={() => onOpenMangaDetails(manga)}
                    >
                      จัดการตอนมังงะ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* WORKSPACE / QUEUE TAB */}
      {activeTab === 'workspace' && (
        <div style={styles.content}>
          {downloads.length === 0 ? (
            <div style={styles.emptyCard} className="glass-panel">
              <span style={{ fontSize: '3rem' }}>⚡</span>
              <h3>ไม่มีภาระงานแปลที่ค้างอยู่</h3>
              <p>เลือกมังงะที่คุณสนใจแล้วกด "แปลด้วย AI" เพื่อส่งประมวลผลบทแปลภาษาไทยได้ทันที</p>
            </div>
          ) : (
            <div style={styles.queueList}>
              {downloads.map((job) => {
                const isExpanded = expandedLogJobId === job.id;
                const logs = getSimulatedLogs(job);
                
                return (
                  <div key={job.id} style={styles.jobCard} className="glass-panel">
                    <div style={styles.jobMeta}>
                      <img src={job.coverUrl} alt={job.mangaTitle} style={styles.jobCover} />
                      <div style={styles.jobText}>
                        <h4 style={styles.jobTitle}>{job.mangaTitle}</h4>
                        <p style={styles.jobChapter}>
                          ตอนที่ {job.chapter} {job.chapterTitle && `- ${job.chapterTitle}`}
                        </p>
                        <div style={styles.jobStatusContainer}>
                          <span 
                            className="badge" 
                            style={
                              job.status === 'completed' 
                                ? { background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', border: '1px solid rgba(16, 185, 129, 0.3)' } 
                                : { background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', border: '1px solid rgba(245, 158, 11, 0.3)' }
                            }
                          >
                            {job.status === 'completed' ? 'แปลสำเร็จ' : job.status === 'downloading' ? 'ดาวน์โหลด' : job.status === 'cleaning' ? 'คลีนรูปภาพ' : job.status === 'ocr' ? 'OCR' : job.status === 'translating' ? 'AI แปลไทย' : job.status.toUpperCase()}
                          </span>
                          <span style={styles.pagesText}>{job.pages || 16} หน้า</span>
                        </div>
                      </div>
                    </div>

                    {/* AI Pipeline Flowchart - Simplified view for a clean Reader experience */}
                    {job.status !== 'queued' && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        margin: '12px 0',
                        background: 'rgba(255, 255, 255, 0.02)',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: '1px solid rgba(255, 255, 255, 0.05)',
                      }} className="glass-panel">
                        <span style={{ fontSize: '1.2rem' }}>
                          {job.status === 'completed' ? '✅' : (PIPELINE_STEPS[getActiveStepIndex(job.status)]?.icon || '🤖')}
                        </span>
                        <span style={{ fontSize: '0.85rem', fontWeight: '700', color: job.status === 'completed' ? '#34d399' : 'var(--accent-cyan)' }}>
                          สถานะตอนแปลไทย: {job.status === 'completed' ? 'แปลสำเร็จพร้อมอ่าน' : `กำลังประมวลผลแปลด้วย AI (${PIPELINE_STEPS[getActiveStepIndex(job.status)]?.label})`}
                        </span>
                        {job.status !== 'completed' && (
                          <span className="loading-spinner" style={{
                            width: '12px',
                            height: '12px',
                            border: '2px solid rgba(255, 255, 255, 0.1)',
                            borderTopColor: 'var(--accent-cyan)',
                            borderRadius: '50%',
                            animation: 'spin 0.6s linear infinite',
                          }}></span>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div style={styles.progressSection}>
                      <div style={styles.progressBarWrapper}>
                        <div 
                          style={{
                            ...styles.progressBar,
                            width: `${job.progress}%`,
                            background: job.status === 'completed' 
                              ? 'linear-gradient(90deg, #10b981, var(--accent-cyan))' 
                              : 'linear-gradient(90deg, var(--accent-purple), var(--accent-cyan))'
                          }} 
                        />
                      </div>
                      <span style={styles.progressPercent}>{job.progress}%</span>
                    </div>

                    {/* Job Actions */}
                    <div style={{
                      ...styles.jobActions,
                      ...(isMobile ? { flexDirection: 'column', alignItems: 'stretch', gap: '12px' } : {})
                    }}>
                      <button 
                        className="btn btn-secondary" 
                        style={{ padding: '8px 16px', fontSize: '0.85rem', ...(isMobile ? { width: '100%' } : {}) }}
                        onClick={() => toggleLogExpand(job.id)}
                      >
                        {isExpanded ? 'ซ่อนสถานะขั้นตอนแปลภาษา AI ▲' : '🛠️ ตรวจสอบสถานะขั้นตอนแปลภาษา AI (สำหรับผู้พัฒนา) ▼'}
                      </button>
                      
                      <div style={{ display: 'flex', gap: '8px', ...(isMobile ? { width: '100%' } : {}) }}>
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '8px 16px', fontSize: '0.85rem', flex: 1 }}
                          onClick={() => onCancelDownload(job.id)}
                        >
                          ลบงานแปล
                        </button>
                        <button 
                          className={job.status === 'completed' ? 'btn btn-cyan' : 'btn btn-secondary'}
                          style={{ padding: '8px 20px', fontSize: '0.85rem', flex: 2 }}
                          disabled={job.status !== 'completed'}
                          onClick={() => onViewChapter(job)}
                        >
                          📖 เปิดหน้าอ่านมังงะ
                        </button>
                      </div>
                    </div>

                    {/* Terminal Log Console */}
                    {isExpanded && (
                      <div style={styles.consoleLogWrapper} className="animate-fade-in">
                        <div style={styles.consoleHeader}>
                          <span style={styles.consoleTitle}>เทอร์มินัลประมวลผลแปลภาษา -- งานที่ {job.id.substring(0,6)}</span>
                          <span style={styles.consoleDot} className="animate-pulse-slow">● กำลังทำงาน</span>
                        </div>
                        <div style={styles.consoleLogs}>
                          {logs.map((log, index) => (
                            <div 
                              key={index} 
                              style={{
                                ...styles.consoleLine,
                                color: log.includes('[SUCCESS]') 
                                  ? '#10b981' 
                                  : log.includes('[LLM]') 
                                  ? '#d8b4fe' 
                                  : log.includes('[OCR]') 
                                  ? 'var(--accent-cyan)' 
                                  : log.includes('[CLEAN]') 
                                  ? '#f472b6' 
                                  : 'var(--text-main)'
                              }}
                            >
                              <span style={styles.logBullet}>$</span> {log}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
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
  title: {
    fontSize: '2rem',
    color: '#fff',
    marginBottom: '8px',
  },
  subtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.95rem',
  },
  tabsContainer: {
    display: 'flex',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    marginBottom: '32px',
    gap: '24px',
  },
  tabBtn: {
    background: 'none',
    border: 'none',
    borderBottom: '2px solid transparent',
    padding: '12px 4px',
    fontSize: '1rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: '0.2s',
  },
  content: {
    minHeight: '400px',
  },
  emptyCard: {
    padding: '60px 40px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    background: 'var(--bg-card)',
    maxWidth: '500px',
    margin: '0 auto',
    marginTop: '40px',
  },
  // Manga Card specific to Library view
  mangaCard: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-card)',
    overflow: 'hidden',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  coverWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '135%', // Aspect ratio
  },
  cover: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  removeBookmarkBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: 'none',
    background: 'rgba(239, 68, 68, 0.8)',
    color: '#fff',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
  },
  mangaInfo: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    flex: 1,
  },
  mangaTitle: {
    fontSize: '0.95rem',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mangaJapanese: {
    fontSize: '0.75rem',
    color: 'var(--accent-purple)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  tagsContainer: {
    display: 'flex',
    gap: '6px',
  },
  tag: {
    fontSize: '0.65rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
  },
  mangaActionBtn: {
    width: '100%',
    padding: '8px',
    fontSize: '0.8rem',
    marginTop: 'auto',
  },
  // Queue list styles
  queueList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    maxWidth: '900px',
    margin: '0 auto',
  },
  jobCard: {
    padding: '24px',
    background: 'var(--bg-card)',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  jobMeta: {
    display: 'flex',
    gap: '20px',
  },
  jobCover: {
    width: '56px',
    height: '75px',
    objectFit: 'cover',
    borderRadius: '4px',
    border: '1px solid rgba(255,255,255,0.1)',
  },
  jobText: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: '4px',
  },
  jobTitle: {
    fontSize: '1.1rem',
    color: '#fff',
  },
  jobChapter: {
    fontSize: '0.9rem',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  jobStatusContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginTop: '4px',
  },
  pagesText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  progressSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  progressBarWrapper: {
    flex: 1,
    height: '8px',
    background: 'rgba(0, 0, 0, 0.4)',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: '4px',
    transition: 'width 0.4s ease',
  },
  progressPercent: {
    width: '40px',
    textAlign: 'right',
    fontSize: '0.9rem',
    fontWeight: '700',
    color: 'var(--text-main)',
  },
  jobActions: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    paddingTop: '16px',
  },
  // Console Log styles
  consoleLogWrapper: {
    background: '#04050e',
    border: '1px solid rgba(0, 245, 212, 0.15)',
    borderRadius: '6px',
    fontFamily: 'var(--font-mono)',
    overflow: 'hidden',
  },
  consoleHeader: {
    background: '#080b18',
    padding: '8px 16px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.03)',
  },
  consoleTitle: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  consoleDot: {
    fontSize: '0.65rem',
    color: 'var(--accent-cyan)',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  consoleLogs: {
    padding: '16px',
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  consoleLine: {
    fontSize: '0.75rem',
    lineHeight: '1.4',
    textAlign: 'left',
  },
  logBullet: {
    color: 'rgba(255,255,255,0.3)',
    marginRight: '6px',
  },
  // Pipeline Flowchart styles
  pipelineFlowchart: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    margin: '20px 0',
    background: 'rgba(255,255,255,0.01)',
    padding: '16px',
    borderRadius: '10px',
    border: '1px solid rgba(255,255,255,0.03)',
    flexWrap: 'wrap',
    gap: '8px',
  },
  flowStep: {
    flex: 1,
    minWidth: '90px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '10px',
    border: '1px solid transparent',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    position: 'relative',
  },
  flowLabel: {
    fontSize: '0.7rem',
    fontWeight: '700',
    textAlign: 'center',
    marginTop: '4px',
  },
  flowStatusBadge: {
    position: 'absolute',
    top: '-8px',
    background: 'var(--accent-cyan)',
    color: 'var(--text-dark)',
    fontSize: '0.55rem',
    fontWeight: '800',
    padding: '2px 6px',
    borderRadius: '4px',
    letterSpacing: '0.05em',
  },
};

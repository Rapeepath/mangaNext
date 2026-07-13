import { useState, useEffect } from 'react';

export default function Admin({ suggestions = [], onApprove, onReject, onAiTranslate, isMobile }) {
  const [selectedLlm, setSelectedLlm] = useState('gemini-1.5-flash');
  const [selectedOcr, setSelectedOcr] = useState('manga-ocr');
  const [selectedInpaint, setSelectedInpaint] = useState('lama');
  const [confidenceThreshold, setConfidenceThreshold] = useState(70);
  const [glossaryRules, setGlossaryRules] = useState(
    '# Honorifics\nKeep Japanese honorifics (e.g., -kun, -san, -chan, -senpai) untranslated to maintain context.\n\n# SFX Rules\nOnly translate prominent dialogue bubble SFX; small background SFX should be kept with sub-annotations if needed.'
  );

  // Telemetry state simulation
  const [gpuLoad, setGpuLoad] = useState(42);
  const [vramUsage, setVramUsage] = useState(5.8);
  const [queueThreads, setQueueThreads] = useState(2);
  const [jobsProcessed, setJobsProcessed] = useState(148);

  useEffect(() => {
    // Simulate minor telemetry fluctuations
    const interval = setInterval(() => {
      setGpuLoad(Math.floor(30 + Math.random() * 25));
      setVramUsage(parseFloat((5.2 + Math.random() * 1.2).toFixed(1)));
      if (Math.random() > 0.85) {
        setJobsProcessed(prev => prev + 1);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container animate-fade-in" style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>ระบบจัดการและตั้งค่าโมเดลแปลภาษา</h1>
        <p style={styles.subtitle}>กำหนดพารามิเตอร์ของระบบโมเดล OCR, คลีนภาพ, เครื่องมือแปลภาษา AI และติดตามสถานะความร้อนเซิร์ฟเวอร์หลังบ้าน</p>
      </div>

      <div style={{
        ...styles.grid,
        ...(isMobile ? { gridTemplateColumns: '1fr', gap: '20px' } : {})
      }}>
        {/* Left Column: Model Settings */}
        <div style={{
          ...styles.leftCol,
          ...(isMobile ? { padding: '16px' } : {})
        }} className="glass-panel">
          <h3 style={styles.sectionTitle}>โครงสร้างสถาปัตยกรรมโมเดล AI</h3>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>โมเดลภาษา AI แปลบทสนทนา (Translation LLM)</label>
            <select 
              value={selectedLlm} 
              onChange={e => setSelectedLlm(e.target.value)} 
              className="input-field"
              style={styles.select}
            >
              <option value="gemini-1.5-flash">Gemini 1.5 Flash (ค่าเริ่มต้น - แปลเร็วและอิงบริบทเรื่องได้ดี)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro (แปลระดับสูงพิเศษ - เก็บรายละเอียดสำนวน)</option>
              <option value="gpt-4o">GPT-4o (โมเดลมาตรฐานทั่วไป)</option>
              <option value="custom-llama3">Llama-3-Manga-70B (โมเดลที่ปรับจูนสำหรับแปลมังงะโดยเฉพาะ)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>โมเดลถอดตัวอักษรภาพ (OCR Engine)</label>
            <select 
              value={selectedOcr} 
              onChange={e => setSelectedOcr(e.target.value)} 
              className="input-field"
              style={styles.select}
            >
              <option value="manga-ocr">Manga-OCR (ปรับแต่งสำหรับฟอนต์ญี่ปุ่นในหน้ามังงะโดยเฉพาะ)</option>
              <option value="easyocr">EasyOCR (ถอดตัวอักษรรวมภาษาได้หลากหลายชนิดรวดเร็ว)</option>
              <option value="tesseract-5">Tesseract v5 (เครื่องมือถอดภาษาโอเพนซอร์สทั่วไป)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>โมเดลลบตัวอักษรเก่า (Inpainting Model)</label>
            <select 
              value={selectedInpaint} 
              onChange={e => setSelectedInpaint(e.target.value)} 
              className="input-field"
              style={styles.select}
            >
              <option value="lama">LaMa Inpainting (ลบเกลี่ยและฟื้นฟูรายละเอียดพื้นหลังภาพความละเอียดสูง)</option>
              <option value="sd-inpaint">Stable Diffusion XL Inpainter (วาดเกลี่ยภาพด้วย Generative AI)</option>
              <option value="patchmatch">PatchMatch (ลบอักษรแบบจับคู่แพทเทิร์นพื้นหลังอย่างง่าย)</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <div style={styles.sliderHeader}>
              <label style={styles.label}>ระดับความเชื่อมั่นการแปลขั้นต่ำของ OCR (Confidence Threshold)</label>
              <span style={styles.sliderVal}>{confidenceThreshold}%</span>
            </div>
            <input 
              type="range" 
              min="50" 
              max="95" 
              value={confidenceThreshold} 
              onChange={e => setConfidenceThreshold(parseInt(e.target.value))} 
              style={styles.slider}
            />
            <small style={styles.helpText}>บอลลูนคำพูดที่มีคะแนนวิเคราะห์ต่ำกว่าเกณฑ์นี้จะส่งข้อความแจ้งเพื่อให้ทีมแอดมินช่วยตรวจสอบ</small>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>คำสั่ง Prompt และอภิธานศัพท์ที่ใช้ควบคุมการแปล AI</label>
            <textarea
              value={glossaryRules}
              onChange={e => setGlossaryRules(e.target.value)}
              className="input-field"
              style={styles.textarea}
              rows={6}
            />
          </div>

          <button className="btn btn-cyan" style={{ marginTop: '12px', width: '100%' }} onClick={() => alert('บันทึกการตั้งค่าลงในหน่วยความจำเรียบร้อยแล้ว!')}>
            บันทึกการตั้งค่าพารามิเตอร์
          </button>
        </div>

        {/* Right Column: Server Telemetry */}
        <div style={{
          ...styles.rightCol,
          ...(isMobile ? { padding: '16px' } : {})
        }} className="glass-panel">
          <h3 style={styles.sectionTitle}>สถานะประมวลผลเซิร์ฟเวอร์หลังบ้าน (Telemetry)</h3>
          
          <div style={styles.telemetryGrid}>
            <div style={styles.telemCard}>
              <span style={styles.telemLabel}>ภาระการทำงาน GPU (RTX 4090)</span>
              <span style={{...styles.telemVal, color: gpuLoad > 60 ? 'var(--accent-orange)' : 'var(--accent-cyan)'}}>{gpuLoad}%</span>
              <div style={styles.telemBarWrapper}>
                <div style={{...styles.telemBar, width: `${gpuLoad}%`, backgroundColor: gpuLoad > 60 ? 'var(--accent-orange)' : 'var(--accent-cyan)'}} />
              </div>
            </div>

            <div style={styles.telemCard}>
              <span style={styles.telemLabel}>การใช้งาน VRAM การ์ดจอ</span>
              <span style={{...styles.telemVal, color: 'var(--accent-purple)'}}>{vramUsage} GB / 24 GB</span>
              <div style={styles.telemBarWrapper}>
                <div style={{...styles.telemBar, width: `${(vramUsage/24)*100}%`, backgroundColor: 'var(--accent-purple)'}} />
              </div>
            </div>

            <div style={styles.telemCard}>
              <span style={styles.telemLabel}>จำนวนบอร์ดประมวลผลแปลคู่ขนาน</span>
              <span style={{...styles.telemVal, color: '#fff'}}>{queueThreads} บอร์ดประมวลผล</span>
              <p style={styles.telemSub}>ประมวลผลแปลบทความ 1 หน้า / 1.2 วินาที</p>
            </div>

            <div style={styles.telemCard}>
              <span style={styles.telemLabel}>จำนวนบทมังงะแปลสำเร็จรวมสะสม</span>
              <span style={{...styles.telemVal, color: '#10b981'}}>{jobsProcessed} ตอน</span>
              <p style={styles.telemSub}>อัตราการดึงอักษรจากแคชเดิม: 82% cached</p>
            </div>
          </div>

          {/* Model Status Indicators */}
          <div style={styles.statusSection}>
            <h4 style={styles.statusHeader}>สถานะโมเดลและบริการหลัก</h4>
            <div style={styles.statusRow}>
              <span style={styles.statusDot}>●</span>
              <span>เซิร์ฟเวอร์วิเคราะห์ตรวจคำ (OCR): <strong>ออนไลน์</strong> (ความเร็วในการตอบสนอง 80ms)</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusDot}>●</span>
              <span>เซิร์ฟเวอร์คลีนรูปภาพ (LaMa Inpaint): <strong>ออนไลน์</strong> (ความเร็วในการตอบสนอง 210ms)</span>
            </div>
            <div style={styles.statusRow}>
              <span style={styles.statusDot}>●</span>
              <span>ช่องสัญญาณ AI แปลภาษา (LLM Gateway): <strong>ออนไลน์</strong> (ความเร็วในการตอบสนอง 450ms)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Corrections Review Queue */}
      <div style={{
        ...styles.queueContainer,
        ...(isMobile ? { padding: '16px', marginTop: '24px' } : {})
      }} className="glass-panel accent-glow-purple">
        <h3 style={styles.queueTitle}>📥 คิวตรวจสอบคำแปลจากคอมมูนิตี้ (Community Review Queue)</h3>
        <p style={styles.queueSubtitle}>
          สมาชิกคอมมูนิตี้ร่วมส่งคำเสนอแนะแก้ไขบทแปลภาษาไทยเข้ามา แอดมินสามารถตรวจสอบความถูกต้อง กดยอมรับเพื่อนำไปเขียนแทนคำเดิม in Reader หรือสั่งให้ AI แปลข้อความใหม่ตามบริบทได้
        </p>

        {suggestions.filter(s => s.status === 'pending').length === 0 ? (
          <div style={styles.emptyQueue}>
            <span style={{ fontSize: '2.5rem' }}>🎉</span>
            <p style={{ margin: '8px 0 0 0', color: 'var(--text-muted)', fontSize: '0.9rem' }}>ไม่มีคำเสนอแนะค้างตรวจสอบในระบบ คิวของคุณว่างแล้ว!</p>
          </div>
        ) : isMobile ? (
          /* Mobile review queue card listing */
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {suggestions
              .filter(s => s.status === 'pending')
              .map((sug) => (
                <div key={sug.id} style={{
                  padding: '16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                }} className="glass-panel">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: '700', color: '#fff', fontSize: '0.95rem' }}>{sug.mangaTitle}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                        ตอนที่ {sug.chapter} • หน้า {sug.pageNumber} • กรอบคำพูด: {sug.bubbleId}
                      </div>
                    </div>
                    <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>@{sug.contributor}</span>
                  </div>

                  <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', paddingTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>ต้นฉบับ (JA):</div>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-main)', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px' }}>{sug.originalText}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>แปลปัจจุบัน:</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', background: 'rgba(0,0,0,0.2)', padding: '6px 10px', borderRadius: '4px' }}>{sug.currentTranslation}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>เสนอใหม่ (TH):</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--accent-cyan)', fontWeight: '700', background: 'rgba(0, 245, 212, 0.05)', border: '1px solid rgba(0, 245, 212, 0.1)', padding: '6px 10px', borderRadius: '4px' }}>{sug.suggestedTranslation}</div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className="btn btn-cyan" 
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem' }}
                        onClick={() => onApprove(sug.id)}
                      >
                        ✓ อนุมัติ
                      </button>
                      <button 
                        className="btn btn-danger" 
                        style={{ flex: 1, padding: '8px', fontSize: '0.8rem', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                        onClick={() => onReject(sug.id)}
                      >
                        ✗ ปฏิเสธ
                      </button>
                    </div>
                    <button 
                      className="btn btn-secondary" 
                      style={{ width: '100%', padding: '8px', fontSize: '0.8rem', color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', background: 'rgba(157, 78, 221, 0.05)' }}
                      onClick={() => {
                        const customPrompt = prompt("พิมพ์คำสั่งปรับจูน Gemini AI สำหรับช่องนี้:");
                        if (customPrompt !== null) {
                          onAiTranslate(sug.id, customPrompt);
                        }
                      }}
                    >
                      🤖 แปลใหม่ด้วย AI
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          /* Desktop detailed review queue table view */
          <div style={styles.tableWrapper}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.trHeader}>
                  <th style={styles.thCol}>มังงะ/ตอน/พิกัด</th>
                  <th style={styles.thCol}>ผู้เสนอแนะ</th>
                  <th style={styles.thCol}>ข้อความต้นฉบับ (JA)</th>
                  <th style={styles.thCol}>คำแปลปัจจุบัน</th>
                  <th style={styles.thCol}>คำเสนอแนะใหม่ (TH)</th>
                  <th style={{ ...styles.thCol, textAlign: 'center' }}>การจัดการคำแปล</th>
                </tr>
              </thead>
              <tbody>
                {suggestions
                  .filter(s => s.status === 'pending')
                  .map((sug) => (
                    <tr key={sug.id} style={styles.trRow}>
                      <td style={styles.tdCol}>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{sug.mangaTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          ตอนที่ {sug.chapter} • หน้า {sug.pageNumber} • กรอบคำพูด: {sug.bubbleId}
                        </div>
                      </td>
                      <td style={styles.tdCol}>
                        <span className="badge badge-purple">@{sug.contributor}</span>
                      </td>
                      <td style={{ ...styles.tdCol, fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-main)' }}>
                        {sug.originalText}
                      </td>
                      <td style={{ ...styles.tdCol, color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        {sug.currentTranslation}
                      </td>
                      <td style={{ ...styles.tdCol, color: 'var(--accent-cyan)', fontWeight: '700', fontSize: '0.85rem' }}>
                        {sug.suggestedTranslation}
                      </td>
                      <td style={{ ...styles.tdCol }}>
                        <div style={styles.actionsCell}>
                          <button 
                            className="btn btn-cyan" 
                            style={styles.actionBtn}
                            onClick={() => onApprove(sug.id)}
                          >
                            ✓ อนุมัติ
                          </button>
                          <button 
                            className="btn btn-danger" 
                            style={{ ...styles.actionBtn, background: 'rgba(239, 68, 68, 0.15)', color: '#f87171' }}
                            onClick={() => onReject(sug.id)}
                          >
                            ✗ ปฏิเสธ
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ ...styles.actionBtn, color: 'var(--accent-purple)', borderColor: 'var(--accent-purple)', background: 'rgba(157, 78, 221, 0.05)' }}
                            onClick={() => {
                              const customPrompt = prompt("พิมพ์คำสั่งปรับจูน Gemini AI สำหรับช่องนี้ (เช่น 'แปลสุภาพขึ้น', 'แปลให้ตลกๆ', 'แปลแบบเพื่อนสนิท'):");
                              if (customPrompt !== null) {
                                onAiTranslate(sug.id, customPrompt);
                              }
                            }}
                          >
                            🤖 แปลใหม่ด้วย AI
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
  grid: {
    display: 'grid',
    gridTemplateColumns: '1.2fr 1fr',
    gap: '32px',
    alignItems: 'start',
  },
  leftCol: {
    padding: '32px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  rightCol: {
    padding: '32px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  sectionTitle: {
    fontSize: '1.25rem',
    color: '#fff',
    marginBottom: '24px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '8px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '0.8rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  select: {
    appearance: 'none',
    background: 'var(--bg-input) url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%2394a3b8\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e") no-repeat right 12px center/18px',
  },
  textarea: {
    fontFamily: 'var(--font-mono)',
    fontSize: '0.8rem',
    resize: 'vertical',
    background: 'var(--bg-input)',
    lineHeight: '1.4',
  },
  sliderHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sliderVal: {
    color: 'var(--accent-cyan)',
    fontWeight: '700',
    fontSize: '0.9rem',
  },
  slider: {
    width: '100%',
    accentColor: 'var(--accent-cyan)',
    margin: '8px 0',
  },
  helpText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
  },
  // Telemetry
  telemetryGrid: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  telemCard: {
    padding: '16px',
    background: 'rgba(0, 0, 0, 0.3)',
    borderRadius: '8px',
    border: '1px solid rgba(255, 255, 255, 0.03)',
  },
  telemLabel: {
    display: 'block',
    fontSize: '0.7rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
    marginBottom: '8px',
  },
  telemVal: {
    fontSize: '1.4rem',
    fontWeight: '800',
    display: 'block',
    marginBottom: '8px',
  },
  telemBarWrapper: {
    width: '100%',
    height: '6px',
    background: 'rgba(255,255,255,0.05)',
    borderRadius: '3px',
    overflow: 'hidden',
  },
  telemBar: {
    height: '100%',
    borderRadius: '3px',
    transition: 'width 0.5s ease',
  },
  telemSub: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    margin: 0,
  },
  statusSection: {
    marginTop: '28px',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    paddingTop: '20px',
  },
  statusHeader: {
    fontSize: '0.9rem',
    color: '#fff',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  statusRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    marginBottom: '8px',
  },
  statusDot: {
    color: '#10b981',
    animation: 'pulse 1.5s infinite',
  },
  // Queue styles
  queueContainer: {
    marginTop: '40px',
    padding: '32px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(157, 78, 221, 0.25)',
  },
  queueTitle: {
    fontSize: '1.4rem',
    color: '#fff',
    marginBottom: '8px',
  },
  queueSubtitle: {
    color: 'var(--text-muted)',
    fontSize: '0.85rem',
    marginBottom: '24px',
    lineHeight: '1.4',
  },
  emptyQueue: {
    padding: '40px',
    textAlign: 'center',
    background: 'rgba(255, 255, 255, 0.01)',
    borderRadius: '8px',
    border: '1px dashed rgba(255, 255, 255, 0.05)',
  },
  tableWrapper: {
    overflowX: 'auto',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
  },
  trHeader: {
    borderBottom: '2px solid rgba(255, 255, 255, 0.08)',
  },
  thCol: {
    padding: '12px 16px',
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  trRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: 'background-color 0.2s',
  },
  tdCol: {
    padding: '16px',
    fontSize: '0.9rem',
    verticalAlign: 'middle',
  },
  actionsCell: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  actionBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
    fontWeight: '700',
  },
};

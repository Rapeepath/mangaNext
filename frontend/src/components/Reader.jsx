import { useState, useEffect } from 'react';

const MOCK_PAGES = [
  {
    pageNumber: 1,
    panels: [
      {
        id: 'p1-1',
        gridStyle: { gridColumn: 'span 2', height: '260px' },
        bg: 'linear-gradient(135deg, #1f2029 0%, #0d0e12 100%)',
        type: 'intro',
        title: 'PANEL 1: THE PORTAL',
        bubbles: [
          {
            id: 'b1-1-1',
            top: '25%', left: '15%', width: '150px', height: '90px',
            original: 'ついに、この時が来たか...',
            translated: 'ในที่สุด ช่วงเวลานี้ก็มาถึงเสียที...',
            confidence: 98.6,
            speaker: 'Mysterious Mage'
          }
        ]
      },
      {
        id: 'p1-2',
        gridStyle: { gridColumn: 'span 1', height: '320px' },
        bg: 'linear-gradient(45deg, #181921 0%, #281e33 100%)',
        type: 'question',
        title: 'PANEL 2: DOUBT',
        bubbles: [
          {
            id: 'b1-2-1',
            top: '20%', left: '45%', width: '130px', height: '80px',
            original: '本当に一人で行くのか？',
            translated: 'เจ้าจะไปคนเดียวจริงๆ หรือ?',
            confidence: 97.4,
            speaker: 'Companion'
          }
        ]
      },
      {
        id: 'p1-3',
        gridStyle: { gridColumn: 'span 1', height: '320px' },
        bg: 'linear-gradient(225deg, #0d0d14 0%, #1e1f2b 100%)',
        type: 'answer',
        title: 'PANEL 3: RESOLVE',
        bubbles: [
          {
            id: 'b1-3-1',
            top: '45%', left: '15%', width: '140px', height: '90px',
            original: 'ああ。約束だからな。',
            translated: 'อืม เพราะมันเป็นสัญญาน่ะ',
            confidence: 99.2,
            speaker: 'Hero'
          }
        ]
      }
    ]
  },
  {
    pageNumber: 2,
    panels: [
      {
        id: 'p2-1',
        gridStyle: { gridColumn: 'span 1', height: '280px' },
        bg: 'linear-gradient(185deg, #2b1c3d 0%, #0d0e14 100%)',
        type: 'shout',
        title: 'PANEL 1: WARNING',
        bubbles: [
          {
            id: 'b2-1-1',
            top: '25%', left: '30%', width: '130px', height: '80px',
            original: 'おい、あれを見ろ！',
            translated: 'เฮ้ย! ดูนั่นสิ!',
            confidence: 96.8,
            speaker: 'Companion'
          }
        ]
      },
      {
        id: 'p2-2',
        gridStyle: { gridColumn: 'span 1', gridRow: 'span 2', height: '580px' },
        bg: 'linear-gradient(135deg, #1c2e3d 0%, #0a111a 100%)',
        type: 'discovery',
        title: 'PANEL 2: THE BEAST',
        bubbles: [
          {
            id: 'b2-2-1',
            top: '15%', left: '15%', width: '150px', height: '100px',
            original: '信じられない... 何という魔力だ...',
            translated: 'เหลือเชื่อจริงๆ... พลังเวทมนตร์อะไรกันเนี่ย...',
            confidence: 99.1,
            speaker: 'Hero'
          },
          {
            id: 'b2-2-2',
            top: '65%', left: '40%', width: '120px', height: '80px',
            original: '逃げろ！早く！',
            translated: 'หนีไป! เร็วเข้า!',
            confidence: 99.8,
            speaker: 'Companion'
          }
        ]
      },
      {
        id: 'p2-3',
        gridStyle: { gridColumn: 'span 1', height: '280px' },
        bg: 'linear-gradient(25deg, #13141c 0%, #331923 100%)',
        type: 'despair',
        title: 'PANEL 3: IMPACT',
        bubbles: [
          {
            id: 'b2-3-1',
            top: '30%', left: '20%', width: '130px', height: '85px',
            original: '手遅れだ。奴が来る！',
            translated: 'ไม่ทันแล้ว มันมาแล้ว!',
            confidence: 98.0,
            speaker: 'Hero'
          }
        ]
      }
    ]
  },
  {
    pageNumber: 3,
    panels: [
      {
        id: 'p3-1',
        gridStyle: { gridColumn: 'span 2', height: '580px' },
        bg: 'linear-gradient(0deg, #0f1326 0%, #202b66 100%)',
        type: 'climax',
        title: 'PANEL 1: CLIMAX (SPREAD)',
        bubbles: [
          {
            id: 'b3-1-1',
            top: '15%', left: '45%', width: '180px', height: '110px',
            original: '私は諦めない！何度でも立ち上がる！',
            translated: 'ฉันจะไม่ยอมแพ้! จะลุกขึ้นสู้ใหม่อีกกี่ครั้งก็ยอม!',
            confidence: 99.5,
            speaker: 'Hero'
          },
          {
            id: 'b3-1-2',
            top: '60%', left: '15%', width: '150px', height: '90px',
            original: '終わりだ、無駄な足掻きを。',
            translated: 'จบสิ้นแล้ว เจ้ามนุษย์ การดิ้นรนของเจ้ามันสูญเปล่า',
            confidence: 98.7,
            speaker: 'Demon Lord'
          }
        ]
      }
    ]
  }
];

export default function Reader({ activeJob, onClose, customTranslations, onSuggestTranslation, suggestions, user, isMobile, onRequireLogin }) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [viewMode, setViewMode] = useState('translated'); // 'translated', 'original', 'ocr'
  const [hoveredBubble, setHoveredBubble] = useState(null);
  
  // Local translations edits dictionary
  const [showSuccessMsg, setShowSuccessMsg] = useState(false);
  const [activeEditingBubble, setActiveEditingBubble] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [isEditModeEnabled, setIsEditModeEnabled] = useState(false);

  // Turn off edit mode automatically on logout
  useEffect(() => {
    if (!user) {
      setIsEditModeEnabled(false);
    }
  }, [user]);

  const handleToggleEditMode = () => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนเพื่อเสนอแก้ไขคำแปลมังงะในคอมมูนิตี้');
      if (onRequireLogin) onRequireLogin();
      return;
    }
    setIsEditModeEnabled(prev => !prev);
  };

  const getInitialScale = () => {
    if (typeof window !== 'undefined') {
      return window.innerWidth <= 768 ? Math.max(0.45, parseFloat(((window.innerWidth - 32) / 600).toFixed(2))) : 1;
    }
    return 1;
  };
  const [zoomScale, setZoomScale] = useState(getInitialScale());

  // Automatically recalculate scale for mobile on orientation/resize changes
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setZoomScale(Math.max(0.45, parseFloat(((window.innerWidth - 32) / 600).toFixed(2))));
      } else {
        setZoomScale(1);
      }
    };
    window.addEventListener('resize', handleResize);
    handleResize(); // trigger initially
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const currentPage = MOCK_PAGES[currentPageIndex];
  
  const handlePageChange = (index) => {
    if (index >= 0 && index < MOCK_PAGES.length) {
      setCurrentPageIndex(index);
      setActiveEditingBubble(null);
    }
  };

  const handleStartEdit = (bubble) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนเพื่อเสนอแก้ไขคำแปลมังงะในคอมมูนิตี้');
      if (onRequireLogin) onRequireLogin();
      return;
    }
    setActiveEditingBubble(bubble);
    setEditingText(customTranslations[bubble.id] !== undefined ? customTranslations[bubble.id] : bubble.translated);
  };

  const handleSaveEdit = () => {
    if (activeEditingBubble && editingText.trim()) {
      onSuggestTranslation(activeEditingBubble, editingText);
      setShowSuccessMsg(true);
      setTimeout(() => {
        setShowSuccessMsg(false);
      }, 4000);
      setActiveEditingBubble(null);
      setEditingText('');
    }
  };

  return (
    <div className="container animate-fade-in" style={{
      ...styles.container,
      ...(isMobile ? { height: 'auto', paddingBottom: activeEditingBubble ? '320px' : '40px' } : {})
    }}>
      {/* Top Toolbar bar */}
      <div style={{
        ...styles.toolbar,
        ...(isMobile ? {
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: '12px',
          padding: '12px 14px',
          marginBottom: '10px',
        } : {})
      }} className="glass-panel">
        <div style={{
          ...styles.toolbarLeft,
          ...(isMobile ? {
            justifyContent: 'space-between',
            width: '100%',
          } : {})
        }}>
          <button className="btn btn-secondary" style={styles.backBtn} onClick={onClose}>
            {isMobile ? '← ออก' : '← ออกจากหน้าอ่านมังงะ'}
          </button>
          <div style={styles.titleInfo}>
            <h4 style={{
              ...styles.mangaTitle,
              ...(isMobile ? { fontSize: '0.85rem', maxWidth: '160px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } : {})
            }} title={activeJob.mangaTitle}>{activeJob.mangaTitle}</h4>
            <span style={styles.chapterBadge} className="badge badge-purple">
              ตอนที่ {activeJob.chapter}
            </span>
          </div>
        </div>

        {/* Page Control */}
        <div style={{
          ...styles.pageControls,
          ...(isMobile ? {
            justifyContent: 'center',
            width: '100%',
            gap: '12px',
          } : {})
        }}>
          <button 
            className="btn btn-secondary" 
            style={{
              ...styles.controlBtn,
              ...(isMobile ? { padding: '6px 10px', fontSize: '0.75rem' } : {})
            }} 
            disabled={currentPageIndex === 0}
            onClick={() => handlePageChange(currentPageIndex - 1)}
          >
            ◀ ก่อนหน้า
          </button>
          <span style={{
            ...styles.pageIndicator,
            ...(isMobile ? { fontSize: '0.8rem' } : {})
          }}>
            หน้า {currentPageIndex + 1} จาก {MOCK_PAGES.length}
          </span>
          <button 
            className="btn btn-secondary" 
            style={{
              ...styles.controlBtn,
              ...(isMobile ? { padding: '6px 10px', fontSize: '0.75rem' } : {})
            }} 
            disabled={currentPageIndex === MOCK_PAGES.length - 1}
            onClick={() => handlePageChange(currentPageIndex + 1)}
          >
            ถัดไป ▶
          </button>
        </div>

        {/* Mode Selector & Zoom */}
        <div style={{
          ...styles.toolbarRight,
          ...(isMobile ? {
            justifyContent: 'space-between',
            width: '100%',
            gap: '8px',
          } : {})
        }}>
          <div style={{
            ...styles.modeGroup,
            ...(isMobile ? { flex: 1 } : {})
          }}>
            <button 
              style={{
                ...styles.modeBtn, 
                backgroundColor: viewMode === 'translated' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                color: viewMode === 'translated' ? '#fff' : 'var(--text-muted)',
                ...(isMobile ? { padding: '6px 8px', fontSize: '0.7rem', flex: 1, textAlign: 'center' } : {})
              }}
              onClick={() => setViewMode('translated')}
            >
              แปลไทย (AI)
            </button>
            <button 
              style={{
                ...styles.modeBtn, 
                backgroundColor: viewMode === 'original' ? 'var(--accent-purple)' : 'rgba(255,255,255,0.05)',
                color: viewMode === 'original' ? '#fff' : 'var(--text-muted)',
                ...(isMobile ? { padding: '6px 8px', fontSize: '0.7rem', flex: 1, textAlign: 'center' } : {})
              }}
              onClick={() => setViewMode('original')}
            >
              ญี่ปุ่นต้นฉบับ
            </button>
            <button 
              style={{
                ...styles.modeBtn, 
                backgroundColor: viewMode === 'ocr' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                color: viewMode === 'ocr' ? 'var(--text-dark)' : 'var(--text-muted)',
                ...(isMobile ? { padding: '6px 8px', fontSize: '0.75rem', flex: 1.5, textAlign: 'center' } : {})
              }}
              onClick={() => setViewMode('ocr')}
            >
              กรอบข้อความ OCR
            </button>
          </div>

          {/* Edit Mode Toggle Button */}
          <button 
            style={{
              padding: '6px 12px',
              fontSize: '0.8rem',
              borderRadius: '4px',
              cursor: 'pointer',
              fontWeight: 'bold',
              border: isEditModeEnabled ? '1px solid var(--accent-purple)' : '1px solid rgba(255, 255, 255, 0.1)',
              background: isEditModeEnabled ? 'rgba(157, 78, 221, 0.2)' : 'rgba(255, 255, 255, 0.05)',
              color: isEditModeEnabled ? '#d8b4fe' : 'var(--text-muted)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              transition: '0.2s',
              height: '32px',
              ...(isMobile ? { width: '100%', padding: '8px' } : {})
            }}
            onClick={handleToggleEditMode}
          >
            ✏️ {isEditModeEnabled ? 'โหมดเสนอแก้ไข: เปิด' : 'โหมดเสนอแก้ไข: ปิด'}
          </button>

          <div style={styles.zoomGroup}>
            <button style={styles.zoomBtn} onClick={() => setZoomScale(Math.max(0.3, zoomScale - 0.05))}>−</button>
            <span style={{
              ...styles.zoomText,
              ...(isMobile ? { fontSize: '0.75rem', width: '38px' } : {})
            }}>{Math.round(zoomScale * 100)}%</span>
            <button style={styles.zoomBtn} onClick={() => setZoomScale(Math.min(1.5, zoomScale + 0.05))}>+</button>
          </div>
        </div>
      </div>

      {/* Reader Layout Workspace */}
      <div style={{
        ...styles.workspace,
        ...(isMobile ? { flexDirection: 'column', overflow: 'visible', gap: '10px' } : {})
      }}>
        {/* Main Manga Canvas */}
        <div style={{
          ...styles.canvasContainer,
          ...(isMobile ? { padding: '10px', height: 'calc(100vh - 240px)', minHeight: '380px', overflowX: 'auto', overflowY: 'auto' } : {})
        }}>
          <div 
            style={{
              ...styles.mangaPage,
              transform: `scale(${zoomScale})`,
              transformOrigin: 'top center',
            }}
            className="glass-panel"
          >
            {/* Page Grid Structure */}
            <div style={styles.pageGrid}>
              {currentPage.panels.map((panel) => (
                <div 
                  key={panel.id} 
                  style={{
                    ...styles.panelBox,
                    ...panel.gridStyle,
                    backgroundImage: panel.bg
                  }}
                >
                  {/* Decorative manga effect layout */}
                  <div style={styles.screentoneOverlay}></div>
                  <span style={styles.panelTitleBadge}>{panel.title}</span>

                  {/* Render Panel Speech Bubbles */}
                  {panel.bubbles.map((bubble) => {
                    const activeText = customTranslations[bubble.id] || bubble.translated;
                    const isHovered = hoveredBubble?.id === bubble.id;
                    const isOcrMode = viewMode === 'ocr';
                    const pendingSugCount = suggestions.filter(s => s.bubbleId === bubble.id && s.status === 'pending').length;
                    
                    return (
                      <div
                        key={bubble.id}
                        style={{
                          ...styles.bubbleWrapper,
                          top: bubble.top,
                          left: bubble.left,
                          width: bubble.width,
                          height: bubble.height,
                          border: isOcrMode 
                            ? '2px dashed var(--accent-cyan)' 
                            : (pendingSugCount > 0 && isEditModeEnabled)
                            ? '2px dashed var(--accent-orange)'
                            : (isHovered && isEditModeEnabled)
                            ? '2px solid var(--accent-purple)' 
                            : '2px solid transparent',
                          backgroundColor: isOcrMode 
                            ? 'rgba(0, 245, 212, 0.15)' 
                            : (pendingSugCount > 0 && isEditModeEnabled)
                            ? 'rgba(255, 159, 28, 0.05)'
                            : (isHovered && isEditModeEnabled)
                            ? 'rgba(255, 255, 255, 0.98)' 
                            : 'rgba(255, 255, 255, 0.85)',
                          boxShadow: (isHovered && isEditModeEnabled)
                            ? '0 0 15px rgba(157, 78, 221, 0.5)' 
                            : (pendingSugCount > 0 && isEditModeEnabled) 
                            ? '0 0 8px rgba(255, 159, 28, 0.3)'
                            : 'none'
                        }}
                        onMouseEnter={() => setHoveredBubble(bubble)}
                        onMouseLeave={() => setHoveredBubble(null)}
                        onClick={() => {
                          if (isEditModeEnabled) {
                            handleStartEdit(bubble);
                          }
                        }}
                        title={isEditModeEnabled ? (pendingSugCount > 0 ? "คลิกเพื่อดูประวัติคำแปลที่เสนอแนะ" : "คลิกเพื่อเสนอคำแปลที่สละสลวยขึ้น") : undefined}
                      >
                        {/* Pencil Edit Icon shown on hover */}
                        {isHovered && isEditModeEnabled && !isOcrMode && (
                          <span style={{
                            position: 'absolute',
                            bottom: '-8px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            background: 'var(--accent-purple)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            padding: '2px 6px',
                            borderRadius: '10px',
                            boxShadow: '0 0 6px rgba(157, 78, 221, 0.6)',
                            pointerEvents: 'none',
                            zIndex: 10,
                            whiteSpace: 'nowrap'
                          }}>
                            ✏️ เสนอแนะคำแปล
                          </span>
                        )}
                        {/* Bounding box badge in OCR mode */}
                        {isOcrMode && (
                          <span style={styles.ocrBadge}>
                            {bubble.confidence}%
                          </span>
                        )}

                        {/* Dialogue Correction Alert Icon */}
                        {pendingSugCount > 0 && !isOcrMode && (
                          <span style={{
                            position: 'absolute',
                            top: '-8px',
                            right: '-8px',
                            background: 'var(--accent-orange)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 'bold',
                            width: '16px',
                            height: '16px',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 8px rgba(255, 159, 28, 0.6)'
                          }} title={`${pendingSugCount} community suggestion(s)`}>
                            💡
                          </span>
                        )}

                        {/* Bubble Text */}
                        {viewMode === 'original' ? (
                          <div style={styles.jaText}>
                            {bubble.original}
                          </div>
                        ) : (
                          <div style={styles.enText}>
                            {activeText}
                          </div>
                        )}

                        {/* Hover Quick Statistics Tooltip */}
                        {isHovered && !activeEditingBubble && (
                          <div style={styles.tooltip} className="glass-panel">
                            <div style={styles.tooltipHeader}>
                              <strong>ข้อมูลช่องบทสนทนา</strong>
                              <span className="badge badge-cyan">{bubble.confidence}% Acc</span>
                            </div>
                            <p style={styles.tooltipLine}><strong>ตัวละคร:</strong> {bubble.speaker}</p>
                            <p style={styles.tooltipLine}><strong>ญี่ปุ่น (JA):</strong> {bubble.original}</p>
                            <p style={styles.tooltipLine}>
                              <strong>ไทย (TH):</strong> {activeText.substring(0, 30)}...
                            </p>
                            <small style={styles.tooltipTip}>
                              {isEditModeEnabled ? (
                                pendingSugCount > 0 
                                  ? `💡 มี ${pendingSugCount} ข้อเสนอแนะ! คลิกเพื่อดูรายละเอียด` 
                                  : '💡 คลิกเพื่อร่วมเสนอคำแปลที่ดีกว่า'
                              ) : (
                                '💡 เปิดโหมดเสนอแก้ไขเพื่อร่วมปรับแต่งคำแปล'
                              )}
                            </small>
                            {isEditModeEnabled && (
                              <button
                                style={{
                                  width: '100%',
                                  marginTop: '4px',
                                  padding: '6px',
                                  fontSize: '0.75rem',
                                  background: 'var(--accent-purple)',
                                  border: 'none',
                                  color: '#fff',
                                  borderRadius: '4px',
                                  cursor: 'pointer',
                                  fontWeight: 'bold',
                                  textAlign: 'center',
                                }}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStartEdit(bubble);
                                }}
                              >
                                ✏️ แจ้งเสนอแนะแก้ไขคำแปล
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SIDE EDIT PANEL (Appears when clicking on a speech bubble) */}
        {activeEditingBubble && (
          <div style={{
            ...styles.editSidebar,
            ...(isMobile ? {
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              top: 'auto',
              width: '100%',
              maxHeight: '75vh',
              zIndex: 2000,
              borderRadius: '20px 20px 0 0',
              borderWidth: '2px 0 0 0',
              boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.9), var(--shadow-glow)',
              background: 'rgba(10, 12, 30, 0.98)',
            } : {})
          }} className="glass-panel animate-fade-in">
            <div style={styles.sidebarHeader}>
              <h3>เสนอแนะคำแปลที่สละสลวยขึ้น</h3>
              <button style={styles.closeSidebarBtn} onClick={() => {
                setActiveEditingBubble(null);
                setEditingText('');
              }}>✕</button>
            </div>
            
            <div style={styles.sidebarBody}>
              {/* Alert Message for Successful Submission */}
              {showSuccessMsg && (
                <div style={styles.successBanner} className="animate-fade-in">
                  🎉 เสนอแก้ไขคำแปลเรียบร้อย! ส่งเรื่องเข้าคิวให้แอดมินพิจารณาแล้ว
                </div>
              )}

              <div style={styles.sidebarMetaRow}>
                <span className="badge badge-purple">ตัวละคร: {activeEditingBubble.speaker}</span>
                <span className="badge badge-cyan">OCR: {activeEditingBubble.confidence}%</span>
              </div>

              <div style={styles.sidebarGroup}>
                <label style={styles.sidebarLabel}>ข้อความต้นฉบับ (Japanese)</label>
                <div style={styles.readonlyTextBox}>
                  {activeEditingBubble.original}
                </div>
              </div>

              <div style={styles.sidebarGroup}>
                <label style={styles.sidebarLabel}>คำแปลปัจจุบัน (Active Translation)</label>
                <div style={{...styles.readonlyTextBox, fontWeight: 'bold', background: 'rgba(0, 245, 212, 0.04)', borderColor: 'rgba(0, 245, 212, 0.2)'}}>
                  {customTranslations[activeEditingBubble.id] || activeEditingBubble.translated}
                </div>
              </div>

              {/* LIST EXISTING SUGGESTIONS */}
              <div style={styles.sidebarGroup}>
                <label style={styles.sidebarLabel}>คำเสนอแนะจากคอมมูนิตี้ ({suggestions.filter(s => s.bubbleId === activeEditingBubble.id).length})</label>
                <div style={styles.suggestionsList}>
                  {suggestions.filter(s => s.bubbleId === activeEditingBubble.id).length === 0 ? (
                    <div style={styles.noSuggestionsText}>ยังไม่มีข้อเสนอแก้ไข มาร่วมช่วยกันแปลเป็นคนแรก!</div>
                  ) : (
                    suggestions
                      .filter(s => s.bubbleId === activeEditingBubble.id)
                      .map((sug) => (
                        <div key={sug.id} style={{
                          ...styles.suggestionItem,
                          borderLeft: sug.status === 'approved' ? '3px solid #10b981' : sug.status === 'rejected' ? '3px solid #ef4444' : '3px solid #f59e0b'
                        }}>
                          <div style={styles.sugHeader}>
                            <strong>@{sug.contributor}</strong>
                            <span className="badge" style={
                              sug.status === 'approved' 
                                ? { background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', fontSize: '0.65rem' }
                                : sug.status === 'rejected'
                                ? { background: 'rgba(239, 68, 68, 0.1)', color: '#f87171', fontSize: '0.65rem' }
                                : { background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', fontSize: '0.65rem' }
                            }>
                              {sug.status === 'approved' ? 'อนุมัติแล้ว' : sug.status === 'rejected' ? 'ปฏิเสธแล้ว' : 'รอตรวจสอบ'}
                            </span>
                          </div>
                          <div style={styles.sugText}>"{sug.suggestedTranslation}"</div>
                          <span style={styles.sugTime}>{new Date(sug.timestamp).toLocaleTimeString()}</span>
                        </div>
                      ))
                  )}
                </div>
              </div>

              {/* WRITE NEW SUGGESTION */}
              <div style={styles.sidebarGroup}>
                <label style={styles.sidebarLabel}>เสนอคำแปลภาษาไทยใหม่ (Suggest Edit)</label>
                <textarea
                  style={styles.sidebarTextarea}
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  placeholder="พิมพ์บทแปลใหม่ที่เหมาะสมสำหรับฉากนี้..."
                  rows={3}
                />
              </div>

              <div style={styles.sidebarActions}>
                <button 
                  className="btn btn-secondary" 
                  style={{ flex: 1 }} 
                  onClick={() => {
                    setActiveEditingBubble(null);
                    setEditingText('');
                  }}
                >
                  ยกเลิก
                </button>
                <button 
                  className="btn btn-cyan" 
                  style={{ flex: 2 }} 
                  onClick={handleSaveEdit}
                  disabled={!editingText.trim()}
                >
                  ส่งคำเสนอแนะแก้ไข
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '20px',
    paddingBottom: '40px',
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 64px)', // Deduct navigation height
    boxSizing: 'border-box',
  },
  toolbar: {
    padding: '12px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    background: 'var(--bg-card)',
    marginBottom: '20px',
    flexShrink: 0,
    border: '1px solid rgba(255,255,255,0.05)',
  },
  toolbarLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  backBtn: {
    padding: '8px 16px',
    fontSize: '0.85rem',
  },
  titleInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    textAlign: 'left',
  },
  mangaTitle: {
    fontSize: '1rem',
    color: '#fff',
  },
  chapterBadge: {
    fontSize: '0.7rem',
  },
  pageControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  controlBtn: {
    padding: '6px 12px',
    fontSize: '0.8rem',
  },
  pageIndicator: {
    fontSize: '0.9rem',
    fontWeight: '600',
    color: 'var(--text-main)',
  },
  toolbarRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
  },
  modeGroup: {
    display: 'flex',
    borderRadius: '6px',
    overflow: 'hidden',
    border: '1px solid var(--border-color)',
  },
  modeBtn: {
    padding: '8px 14px',
    border: 'none',
    cursor: 'pointer',
    fontWeight: '700',
    fontSize: '0.8rem',
    transition: '0.2s',
  },
  zoomGroup: {
    display: 'flex',
    alignItems: 'center',
    background: 'rgba(0,0,0,0.2)',
    borderRadius: '6px',
    padding: '4px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  zoomBtn: {
    background: 'none',
    border: 'none',
    width: '24px',
    height: '24px',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontWeight: '700',
  },
  zoomText: {
    fontSize: '0.8rem',
    width: '44px',
    textAlign: 'center',
    color: 'var(--text-main)',
  },
  workspace: {
    display: 'flex',
    flex: 1,
    gap: '20px',
    overflow: 'hidden',
    position: 'relative',
  },
  canvasContainer: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'auto',
    padding: '20px',
    background: 'rgba(0,0,0,0.3)',
    borderRadius: '10px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  mangaPage: {
    width: '600px',
    background: '#121319',
    border: '8px solid #000',
    borderRadius: '4px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.6)',
    padding: '16px',
    flexShrink: 0,
    transition: 'transform 0.1s ease',
  },
  pageGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  panelBox: {
    position: 'relative',
    border: '4px solid #000',
    borderRadius: '2px',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  screentoneOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px)',
    backgroundSize: '8px 8px',
    pointerEvents: 'none',
  },
  panelTitleBadge: {
    position: 'absolute',
    top: '8px',
    left: '8px',
    background: '#000',
    color: 'var(--text-muted)',
    fontSize: '0.6rem',
    fontWeight: '700',
    padding: '2px 6px',
    borderRadius: '2px',
    letterSpacing: '0.05em',
    opacity: 0.6,
  },
  bubbleWrapper: {
    position: 'absolute',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '12px',
    cursor: 'pointer',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    userSelect: 'none',
  },
  ocrBadge: {
    position: 'absolute',
    top: '-8px',
    right: '-8px',
    background: 'var(--accent-cyan)',
    color: 'var(--text-dark)',
    fontSize: '0.6rem',
    fontWeight: '700',
    padding: '2px 4px',
    borderRadius: '4px',
    lineHeight: '1',
  },
  enText: {
    color: '#000',
    fontSize: '0.85rem',
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: '1.3',
    fontFamily: '"Itim", "Plus Jakarta Sans", sans-serif', // Simulates Thai handwritten manga font
    letterSpacing: '-0.01em',
    wordBreak: 'break-word',
  },
  jaText: {
    color: '#000',
    fontSize: '0.85rem',
    fontWeight: '800',
    writingMode: 'vertical-rl',
    textOrientation: 'upright',
    lineHeight: '1.4',
    fontFamily: '"MS Mincho", "Hiragino Mincho ProN", serif',
    letterSpacing: '0.1em',
  },
  // Tooltip
  tooltip: {
    position: 'absolute',
    bottom: '105%',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '240px',
    padding: '12px',
    background: 'rgba(10, 12, 30, 0.95)',
    border: '1px solid rgba(157, 78, 221, 0.4)',
    borderRadius: '8px',
    zIndex: 100,
    fontSize: '0.75rem',
    color: 'var(--text-main)',
    textAlign: 'left',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.4)',
  },
  tooltipHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    paddingBottom: '4px',
  },
  tooltipLine: {
    margin: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  tooltipTip: {
    color: 'var(--accent-cyan)',
    fontStyle: 'italic',
    display: 'block',
    marginTop: '2px',
  },
  // Sidebar Editor
  editSidebar: {
    width: '320px',
    background: 'var(--bg-card)',
    border: '1px solid rgba(157, 78, 221, 0.25)',
    borderRadius: '10px',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    textAlign: 'left',
    overflowY: 'auto',
  },
  sidebarHeader: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255,255,255,0.08)',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  closeSidebarBtn: {
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '1rem',
  },
  sidebarBody: {
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sidebarMetaRow: {
    display: 'flex',
    gap: '8px',
  },
  sidebarGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  sidebarLabel: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  readonlyTextBox: {
    padding: '10px 12px',
    background: 'rgba(0,0,0,0.3)',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '6px',
    color: 'var(--text-main)',
    fontSize: '0.8rem',
    lineHeight: '1.4',
  },
  sidebarTextarea: {
    padding: '10px 12px',
    background: 'var(--bg-input)',
    border: '1px solid rgba(157, 78, 221, 0.4)',
    borderRadius: '6px',
    color: '#fff',
    fontSize: '0.85rem',
    lineHeight: '1.4',
    fontFamily: 'inherit',
    outline: 'none',
    resize: 'none',
    transition: 'border-color 0.2s',
  },
  sidebarActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  // Community suggestions elements
  successBanner: {
    padding: '10px 14px',
    background: 'rgba(16, 185, 129, 0.15)',
    border: '1px solid rgba(16, 185, 129, 0.3)',
    borderRadius: '6px',
    color: '#34d399',
    fontSize: '0.8rem',
    fontWeight: '700',
    textAlign: 'center',
  },
  suggestionsList: {
    maxHeight: '180px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingRight: '4px',
  },
  noSuggestionsText: {
    fontSize: '0.75rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
    padding: '8px 0',
  },
  suggestionItem: {
    background: 'rgba(255, 255, 255, 0.02)',
    padding: '8px 12px',
    borderRadius: '6px',
    border: '1px solid rgba(255, 255, 255, 0.04)',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  sugHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: '0.75rem',
  },
  sugText: {
    fontSize: '0.8rem',
    color: '#fff',
    fontWeight: '600',
  },
  sugTime: {
    fontSize: '0.65rem',
    color: 'var(--text-muted)',
    alignSelf: 'flex-end',
  },
};

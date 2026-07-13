import { useState, useEffect, useRef } from 'react';
import Login from './components/Login';
import Main from './components/Main';
import Storage from './components/Storage';
import Reader from './components/Reader';
import Admin from './components/Admin';
import Leaderboard from './components/Leaderboard';

// Initialize mock bookmarks and jobs to make the workspace look active from the start
const INITIAL_BOOKMARKS = [
  {
    id: 'b0b721ff-c388-4486-aa0e-ceec0bc4d5f4',
    title: 'Frieren: Beyond Journey\'s End',
    japaneseTitle: '葬送のフリーレン',
    description: 'The adventure is over but life goes on for an elf mage who\'s just beginning to learn what life is all about...',
    coverUrl: 'https://uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0e-ceec0bc4d5f4/8029c04a-b5e1-4560-b633-9114f0436a51.jpg.256.jpg',
    status: 'ongoing',
    tags: ['Adventure', 'Drama', 'Fantasy']
  },
  {
    id: 'a77742b1-8169-4f21-954f-2c0c5914ab74',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    description: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind...',
    coverUrl: 'https://uploads.mangadex.org/covers/a77742b1-8169-4f21-954f-2c0c5914ab74/96924619-3738-4e12-b91c-799ff248408a.png.256.jpg',
    status: 'ongoing',
    tags: ['Action', 'Comedy', 'Drama']
  }
];

const INITIAL_JOBS = [
  {
    id: 'frieren-ch-1',
    mangaId: 'b0b721ff-c388-4486-aa0e-ceec0bc4d5f4',
    mangaTitle: 'Frieren: Beyond Journey\'s End',
    coverUrl: 'https://uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0e-ceec0bc4d5f4/8029c04a-b5e1-4560-b633-9114f0436a51.jpg.256.jpg',
    chapter: '1',
    chapterTitle: 'The Adventure\'s End',
    pages: 18,
    status: 'completed',
    progress: 100
  }
];

function App() {
  const [user, setUser] = useState(null); // { serverUrl, token, role, username }
  const [currentView, setCurrentView] = useState('home'); // 'home', 'storage', 'admin', 'reader'
  const [bookmarks, setBookmarks] = useState(INITIAL_BOOKMARKS);
  const [downloads, setDownloads] = useState(INITIAL_JOBS);
  const [activeReaderJob, setActiveReaderJob] = useState(null);
  const [mangaToOpenDetails, setMangaToOpenDetails] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Route guard: if trying to access admin view and not logged in as admin
  useEffect(() => {
    if (currentView === 'admin' && (!user || user.role !== 'admin')) {
      setCurrentView('home');
      setShowLoginModal(true);
    }
  }, [currentView, user]);

  const [customTranslations, setCustomTranslations] = useState({
    'b1-1-1': 'ในที่สุด ช่วงเวลานี้ก็มาถึงเสียที...',
    'b1-2-1': 'เจ้าจะไปคนเดียวจริงๆ หรือ?',
    'b1-3-1': 'อืม เพราะมันเป็นสัญญาน่ะ',
    'b2-1-1': 'เฮ้ย! ดูนั่นสิ!',
    'b2-2-1': 'เหลือเชื่อจริงๆ... พลังเวทมนตร์อะไรกันเนี่ย...',
    'b2-2-2': 'หนีไป! เร็วเข้า!',
    'b2-3-1': 'ไม่ทันแล้ว มันมาแล้ว!',
    'b3-1-1': 'ฉันจะไม่ยอมแพ้! จะลุกขึ้นสู้ใหม่อีกกี่ครั้งก็ยอม!',
    'b3-1-2': 'จบสิ้นแล้ว เจ้ามนุษย์ การดิ้นรนของเจ้ามันสูญเปล่า'
  });

  const [suggestions, setSuggestions] = useState([
    {
      id: 'sug-1',
      bubbleId: 'b1-2-1',
      mangaTitle: 'Frieren: Beyond Journey\'s End',
      chapter: '1',
      pageNumber: 1,
      originalText: '本当に一人で行くのか？',
      currentTranslation: 'เจ้าจะไปคนเดียวจริงๆ หรือ?',
      suggestedTranslation: 'นายจะไปคนเดียวจริงๆ งั้นเหรอ?',
      contributor: 'KuroChan',
      status: 'pending',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'sug-2',
      bubbleId: 'b2-2-1',
      mangaTitle: 'Frieren: Beyond Journey\'s End',
      chapter: '1',
      pageNumber: 2,
      originalText: '信じられない... 何という魔力だ...',
      currentTranslation: 'เหลือเชื่อจริงๆ... พลังเวทมนตร์อะไรกันเนี่ย...',
      suggestedTranslation: 'ไม่อยากจะเชื่อเลย... พลังเวทย์อะไรกันขนาดนี้...',
      contributor: 'NekoNeko',
      status: 'pending',
      timestamp: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'sug-3',
      bubbleId: 'b1-1-1',
      mangaTitle: 'Frieren: Beyond Journey\'s End',
      chapter: '1',
      pageNumber: 1,
      originalText: 'ついに、この時が来たか...',
      currentTranslation: 'ในที่สุดช่วงเวลานี้ก็มาถึง...',
      suggestedTranslation: 'ในที่สุด ช่วงเวลานี้ก็มาถึงจนได้...',
      contributor: 'MangaThaisTranslator',
      status: 'approved',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    }
  ]);

  const [leaderboard, setLeaderboard] = useState([
    { username: 'MangaThaisTranslator', approvedCount: 142, points: 1420, level: 'Grandmaster' },
    { username: 'NekoNeko', approvedCount: 98, points: 980, level: 'Master' },
    { username: 'KuroChan', approvedCount: 76, points: 760, level: 'Expert' },
    { username: 'TranslationWizard', approvedCount: 45, points: 450, level: 'Contributor' },
    { username: 'You', approvedCount: 0, points: 0, level: 'Novice' }
  ]);

  // Synchronize user to leaderboard
  useEffect(() => {
    if (user) {
      setLeaderboard(prev => {
        const usernameClean = user.username;
        const exists = prev.some(m => m.username === usernameClean || m.username === 'You');
        if (exists) {
          return prev.map(m => m.username === 'You' ? { ...m, username: usernameClean } : m);
        }
        return [...prev, { username: usernameClean, approvedCount: 0, points: 0, level: 'Novice' }];
      });
    }
  }, [user]);

  const timerRef = useRef(null);

  // Background process simulator: ticks downloading/translation tasks
  useEffect(() => {
    if (downloads.length === 0) return;

    // Check if there are any jobs still in progress
    const hasActiveJobs = downloads.some(job => job.status !== 'completed');
    if (!hasActiveJobs) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    if (!timerRef.current) {
      timerRef.current = setInterval(() => {
        setDownloads(prevJobs => {
          return prevJobs.map(job => {
            if (job.status === 'completed') return job;

            // Increment progress randomly
            const nextProgress = Math.min(100, job.progress + Math.floor(Math.random() * 8) + 8);
            
            // Map progress to status phase
            let nextStatus = 'queued';
            if (nextProgress === 100) nextStatus = 'completed';
            else if (nextProgress >= 85) nextStatus = 'typesetting';
            else if (nextProgress >= 65) nextStatus = 'translating';
            else if (nextProgress >= 45) nextStatus = 'cleaning';
            else if (nextProgress >= 20) nextStatus = 'ocr';
            else if (nextProgress > 0) nextStatus = 'downloading';

            return {
              ...job,
              progress: nextProgress,
              status: nextStatus
            };
          });
        });
      }, 1500);
    }

    return () => {
      if (timerRef.current && !downloads.some(job => job.status !== 'completed')) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [downloads]);

  // Handle User Login
  const handleLogin = (sessionDetails) => {
    setUser(sessionDetails);
    setCurrentView(sessionDetails.role === 'admin' ? 'admin' : 'home');
  };

  // Handle Disconnect
  const handleDisconnect = () => {
    if (confirm('ต้องการยกเลิกการเข้าสู่ระบบและตัดการเชื่อมต่อพื้นที่งานแปลใช่หรือไม่?')) {
      setUser(null);
      setCurrentView('home');
    }
  };

  // Bookmark actions
  const handleToggleBookmark = (manga) => {
    if (!user) {
      alert('กรุณาเข้าสู่ระบบก่อนเพื่อบันทึกมังงะเก็บไว้ในรายการโปรด (Bookmark)');
      setShowLoginModal(true);
      return;
    }
    setBookmarks(prev => {
      const exists = prev.some(b => b.id === manga.id);
      if (exists) {
        return prev.filter(b => b.id !== manga.id);
      } else {
        return [...prev, manga];
      }
    });
  };

  // Trigger Download Chapter
  const handleStartDownload = (manga, chapter) => {
    const jobExists = downloads.some(job => job.id === chapter.id);
    if (jobExists) return;

    const newJob = {
      id: chapter.id,
      mangaId: manga.id,
      mangaTitle: manga.title,
      coverUrl: manga.coverUrl,
      chapter: chapter.chapter,
      chapterTitle: chapter.title,
      pages: chapter.pages || 16,
      status: 'queued',
      progress: 0
    };

    setDownloads(prev => [newJob, ...prev]);
  };

  // Cancel/Delete chapter from workspace
  const handleCancelDownload = (jobId) => {
    if (confirm('Are you sure you want to remove this chapter from workspace storage?')) {
      setDownloads(prev => prev.filter(job => job.id !== jobId));
      if (activeReaderJob?.id === jobId) {
        setActiveReaderJob(null);
        setCurrentView('storage');
      }
    }
  };

  // Open chapter in Reader
  const handleViewChapter = (job) => {
    setActiveReaderJob(job);
    setCurrentView('reader');
  };

  // Open specific bookmarked manga in Main details modal
  const handleOpenMangaDetailsFromLibrary = (manga) => {
    setMangaToOpenDetails(manga);
    setCurrentView('home');
  };

  // Suggest Translation from Reader
  const handleSuggestTranslation = (bubble, proposedText) => {
    const newSug = {
      id: `sug-${Date.now()}`,
      bubbleId: bubble.id,
      mangaTitle: activeReaderJob?.mangaTitle || 'Frieren: Beyond Journey\'s End',
      chapter: activeReaderJob?.chapter || '1',
      pageNumber: activeReaderJob?.pageNumber || 1,
      originalText: bubble.original,
      currentTranslation: customTranslations[bubble.id] || bubble.translated,
      suggestedTranslation: proposedText,
      contributor: user ? user.username : 'Anonymous',
      status: 'pending',
      timestamp: new Date().toISOString()
    };

    setSuggestions(prev => [newSug, ...prev]);
  };

  // Approve a suggested correction
  const handleApproveSuggestion = (suggestionId) => {
    const sug = suggestions.find(s => s.id === suggestionId);
    if (!sug) return;

    setSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'approved' } : s));

    setCustomTranslations(prev => ({
      ...prev,
      [sug.bubbleId]: sug.suggestedTranslation
    }));

    setLeaderboard(prev => {
      return prev.map(m => {
        if (m.username === sug.contributor) {
          const nextCount = m.approvedCount + 1;
          const nextPoints = m.points + 10;
          let nextLevel = m.level;
          if (nextPoints >= 1000) nextLevel = 'Grandmaster';
          else if (nextPoints >= 800) nextLevel = 'Master';
          else if (nextPoints >= 500) nextLevel = 'Expert';
          else if (nextPoints >= 100) nextLevel = 'Contributor';
          return {
            ...m,
            approvedCount: nextCount,
            points: nextPoints,
            level: nextLevel
          };
        }
        return m;
      });
    });
  };

  // Reject a suggestion
  const handleRejectSuggestion = (suggestionId) => {
    setSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'rejected' } : s));
  };

  // Gemini AI Re-translate
  const handleAiReTranslate = (suggestionId, customPrompt) => {
    const sug = suggestions.find(s => s.id === suggestionId);
    if (!sug) return;

    let reTranslatedText = sug.suggestedTranslation;
    if (customPrompt && customPrompt.toLowerCase().includes('สุภาพ')) {
      reTranslatedText = sug.suggestedTranslation + 'ครับ' || sug.currentTranslation + 'ครับ';
    } else {
      reTranslatedText = `[AI] ${sug.suggestedTranslation}`;
    }

    setCustomTranslations(prev => ({
      ...prev,
      [sug.bubbleId]: reTranslatedText
    }));

    setSuggestions(prev => prev.map(s => s.id === suggestionId ? { ...s, status: 'rejected', comment: 'แปลใหม่ด้วย AI แล้ว' } : s));
    
    alert(`Gemini AI Re-translate สำเร็จ!\nข้อความใหม่: "${reTranslatedText}"`);
  };

  // Reader takes up full workspace screen
  if (currentView === 'reader' && activeReaderJob) {
    return (
      <Reader 
        activeJob={activeReaderJob} 
        onClose={() => setCurrentView('storage')} 
        customTranslations={customTranslations}
        onSuggestTranslation={handleSuggestTranslation}
        suggestions={suggestions}
        user={user}
        isMobile={isMobile}
        onRequireLogin={() => setShowLoginModal(true)}
      />
    );
  }

  return (
    <div style={styles.appWrapper}>
      {/* Navigation Header */}
      <header style={styles.header} className="glass-panel">
        <div style={{
          ...styles.headerContainer,
          ...(isMobile ? {
            flexDirection: 'column',
            gap: '12px',
            alignItems: 'center',
            padding: '12px 16px',
          } : {})
        }}>
          <div className="navbar-brand">
            <span>MangaHub</span>
            <span style={{
              fontSize: '0.75rem',
              fontWeight: '800',
              padding: '2px 8px',
              borderRadius: '12px',
              background: !user ? 'rgba(255, 255, 255, 0.05)' : user.role === 'admin' ? 'rgba(157, 78, 221, 0.15)' : 'rgba(0, 245, 212, 0.1)',
              color: !user ? 'var(--text-muted)' : user.role === 'admin' ? '#d8b4fe' : 'var(--accent-cyan)',
              border: !user ? '1px solid rgba(255, 255, 255, 0.1)' : user.role === 'admin' ? '1px solid rgba(157, 78, 221, 0.3)' : '1px solid rgba(0, 245, 212, 0.2)'
            }}>
              ✦ {!user ? 'นักอ่านทั่วไป' : user.role === 'admin' ? 'ผู้ดูแลระบบ' : 'สมาชิกผู้ร่วมเกลาแปล'}
            </span>
          </div>

          <nav style={{
            ...styles.nav,
            ...(isMobile ? {
              flexWrap: 'wrap',
              justifyContent: 'center',
              gap: '6px',
              width: '100%',
            } : {})
          }}>
            {(!user || user.role !== 'admin') && (
              <>
                <button
                  style={{
                    ...styles.navBtn,
                    color: currentView === 'home' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    backgroundColor: currentView === 'home' ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
                    ...(isMobile ? {
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      flex: '1 1 auto',
                      textAlign: 'center',
                    } : {})
                  }}
                  onClick={() => {
                    setCurrentView('home');
                    setMangaToOpenDetails(null);
                  }}
                >
                  🏠 หน้าแรก
                </button>
                <button
                  style={{
                    ...styles.navBtn,
                    color: currentView === 'storage' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                    backgroundColor: currentView === 'storage' ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
                    ...(isMobile ? {
                      padding: '6px 12px',
                      fontSize: '0.8rem',
                      flex: '1 1 auto',
                      textAlign: 'center',
                    } : {})
                  }}
                  onClick={() => setCurrentView('storage')}
                >
                  📚 ชั้นหนังสือของฉัน
                </button>
              </>
            )}

            {user && user.role === 'admin' && (
              <button
                style={{
                  ...styles.navBtn,
                  color: currentView === 'admin' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  backgroundColor: currentView === 'admin' ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
                  ...(isMobile ? {
                    padding: '6px 12px',
                    fontSize: '0.8rem',
                    flex: '1 1 auto',
                    textAlign: 'center',
                  } : {})
                }}
                onClick={() => setCurrentView('admin')}
              >
                ⚙️ ระบบควบคุม AI Telemetry
              </button>
            )}

            <button
              style={{
                ...styles.navBtn,
                color: currentView === 'leaderboard' ? 'var(--accent-cyan)' : 'var(--text-muted)',
                backgroundColor: currentView === 'leaderboard' ? 'rgba(0, 245, 212, 0.05)' : 'transparent',
                ...(isMobile ? {
                  padding: '6px 12px',
                  fontSize: '0.8rem',
                  flex: '1 1 auto',
                  textAlign: 'center',
                } : {})
              }}
              onClick={() => setCurrentView('leaderboard')}
            >
              🏆 ทำเนียบผู้ร่วมเกลาคำแปล
            </button>
          </nav>

          {user ? (
            /* User Session Meta */
            <div style={{
              ...styles.sessionBox,
              ...(isMobile ? {
                width: '100%',
                justifyContent: 'center',
                marginTop: '4px',
              } : {})
            }}>
              <div style={styles.sessionDetails}>
                <div style={styles.username}>{user.username}</div>
                <div style={styles.serverMeta}>
                  <span style={styles.statusOnline}>●</span> เชื่อมต่อระบบหลัก
                </div>
              </div>
              <button 
                style={{
                  ...styles.logoutBtn,
                  fontSize: '0.8rem',
                  background: 'rgba(239, 68, 68, 0.1)',
                  color: '#f87171',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  marginLeft: '8px'
                }} 
                onClick={handleDisconnect} 
                title="ตัดการเชื่อมต่อจากระบบ"
              >
                🔌 ออกระบบ
              </button>
            </div>
          ) : (
            /* Guest Mode: Sign In Button */
            <div style={{
              ...styles.sessionBox,
              ...(isMobile ? {
                width: '100%',
                justifyContent: 'center',
                marginTop: '4px',
              } : {})
            }}>
              <button 
                className="btn btn-cyan" 
                style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: 'bold' }}
                onClick={() => setShowLoginModal(true)}
              >
                เข้าสู่ระบบ
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main Page Routing */}
      <main style={styles.mainContent}>
        {currentView === 'home' && (
          <Main
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            downloads={downloads}
            onStartDownload={handleStartDownload}
            onViewChapter={handleViewChapter}
            // Auto open helper
            initialOpenManga={mangaToOpenDetails}
            isMobile={isMobile}
          />
        )}
        {currentView === 'storage' && (
          <Storage
            bookmarks={bookmarks}
            onToggleBookmark={handleToggleBookmark}
            downloads={downloads}
            onCancelDownload={handleCancelDownload}
            onViewChapter={handleViewChapter}
            onOpenMangaDetails={handleOpenMangaDetailsFromLibrary}
            isMobile={isMobile}
          />
        )}
        {currentView === 'admin' && (
          <Admin 
            suggestions={suggestions} 
            onApprove={handleApproveSuggestion} 
            onReject={handleRejectSuggestion}
            onAiTranslate={handleAiReTranslate}
            isMobile={isMobile}
          />
        )}
        {currentView === 'leaderboard' && (
          <Leaderboard 
            leaderboard={leaderboard} 
            user={user} 
            isMobile={isMobile}
          />
        )}
      </main>

      {/* Footer */}
      <footer style={styles.footer}>
        <div style={{
          ...styles.footerContainer,
          ...(isMobile ? {
            flexDirection: 'column',
            gap: '8px',
            alignItems: 'center',
            textAlign: 'center',
          } : {})
        }}>
          <span>MangaHub AI Translation Platform Prototype</span>
          <span>Workspace Sandbox Connected • React 19 • MangaDex API</span>
        </div>
      </footer>

      {showLoginModal && (
        <div style={styles.modalOverlay} className="animate-fade-in">
          <div style={styles.modalContent}>
            <button 
              style={styles.modalCloseBtn}
              onClick={() => setShowLoginModal(false)}
            >
              ✕
            </button>
            <Login 
              onLogin={(sessionDetails) => {
                handleLogin(sessionDetails);
                setShowLoginModal(false);
              }} 
              isMobile={isMobile} 
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Inline styles for App layout wrapper
const styles = {
  appWrapper: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    position: 'relative',
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 999,
    background: 'rgba(6, 8, 20, 0.85)',
    borderRadius: '0',
    borderWidth: '0 0 1px 0',
  },
  headerContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '12px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  nav: {
    display: 'flex',
    gap: '8px',
  },
  navBtn: {
    border: 'none',
    padding: '8px 16px',
    borderRadius: '6px',
    fontSize: '0.9rem',
    fontWeight: '700',
    cursor: 'pointer',
    transition: '0.2s',
  },
  sessionBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    background: 'rgba(255,255,255,0.03)',
    padding: '6px 12px',
    borderRadius: '8px',
    border: '1px solid rgba(255,255,255,0.05)',
  },
  sessionDetails: {
    textAlign: 'right',
  },
  username: {
    fontSize: '0.8rem',
    fontWeight: '700',
    color: '#fff',
  },
  serverMeta: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '4px',
  },
  statusOnline: {
    color: 'var(--accent-cyan)',
    animation: 'pulse 1.5s infinite',
  },
  logoutBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '1rem',
    opacity: 0.7,
    transition: '0.2s',
  },
  mainContent: {
    flex: 1,
  },
  footer: {
    background: '#04050a',
    borderTop: '1px solid rgba(255,255,255,0.05)',
    padding: '20px 0',
    color: 'var(--text-muted)',
    fontSize: '0.75rem',
  },
  footerContainer: {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '0 24px',
    display: 'flex',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3000,
    backdropFilter: 'blur(8px)',
  },
  modalContent: {
    position: 'relative',
    background: 'none',
    border: 'none',
  },
  modalCloseBtn: {
    position: 'absolute',
    top: '-35px',
    right: '10px',
    background: 'rgba(255, 255, 255, 0.1)',
    color: '#fff',
    border: '1px solid rgba(255, 255, 255, 0.2)',
    borderRadius: '50%',
    width: '30px',
    height: '30px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.85rem',
    zIndex: 3100,
    transition: '0.2s',
  },
};

export default App;

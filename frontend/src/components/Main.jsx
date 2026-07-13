import { useState, useEffect } from 'react';
import { fetchRecommendations, searchManga, fetchChapters } from '../utils/mangadex';

export default function Main({ bookmarks, onToggleBookmark, downloads, onStartDownload, onViewChapter, initialOpenManga, isMobile }) {
  const [recommendations, setRecommendations] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isLoadingRecs, setIsLoadingRecs] = useState(true);
  
  // Details Modal State
  const [selectedManga, setSelectedManga] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [isLoadingChapters, setIsLoadingChapters] = useState(false);

  // Load recommendations on mount
  useEffect(() => {
    const loadRecs = async () => {
      setIsLoadingRecs(true);
      const data = await fetchRecommendations();
      setRecommendations(data);
      setIsLoadingRecs(false);
    };
    loadRecs();
  }, []);

  // Handle initialOpenManga when redirected from library
  useEffect(() => {
    if (initialOpenManga) {
      handleOpenDetails(initialOpenManga);
    }
  }, [initialOpenManga]);

  // Handle Search submit
  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    const results = await searchManga(searchQuery);
    setSearchResults(results);
    setIsSearching(false);
  };

  // Clear Search
  const handleClearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // Open Details Modal and fetch English Chapters
  const handleOpenDetails = async (manga) => {
    setSelectedManga(manga);
    setIsLoadingChapters(true);
    setChapters([]);
    const chapterList = await fetchChapters(manga.id);
    setChapters(chapterList);
    setIsLoadingChapters(false);
  };

  // Check translation job status in parent state
  const getChapterJob = (chapterId) => {
    return downloads.find(job => job.id === chapterId);
  };

  // Featured Manga (first recommended item if loaded)
  const featuredManga = recommendations[0];

  return (
    <div className="container animate-fade-in" style={styles.container}>
      {/* Search Header */}
      <div style={styles.searchBarContainer} className="glass-panel">
        <form onSubmit={handleSearchSubmit} style={{
          ...styles.searchForm,
          ...(isMobile ? { flexDirection: 'column', gap: '10px' } : {})
        }}>
          <div style={styles.searchWrapper}>
            <span style={styles.searchIcon}>🔍</span>
            <input
              type="text"
              placeholder="ค้นหามังงะด้วยชื่อเรื่องจาก MangaDex..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={styles.searchInput}
            />
            {searchQuery && (
              <button type="button" onClick={handleClearSearch} style={styles.clearBtn}>
                ✕
              </button>
            )}
          </div>
          <button type="submit" className="btn btn-cyan" style={{
            ...styles.searchBtn,
            ...(isMobile ? { width: '100%' } : {})
          }} disabled={isSearching}>
            {isSearching ? 'กำลังค้นหา...' : 'ค้นหา'}
          </button>
        </form>
      </div>

      {/* SEARCH RESULTS IF SEARCHING */}
      {searchQuery && (
        <div style={styles.section} className="animate-fade-in">
          <div style={styles.sectionHeader}>
            <h2 style={styles.sectionTitle}>
              ผลการค้นหา {searchResults.length > 0 && `(${searchResults.length})`}
            </h2>
            <button onClick={handleClearSearch} className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              ล้างการค้นหา
            </button>
          </div>
          {isSearching ? (
            <div style={styles.loadingContainer}>
              <span className="loading-spinner" style={styles.spinner}></span>
              <span>กำลังดึงข้อมูลจาก MangaDex API...</span>
            </div>
          ) : searchResults.length === 0 ? (
            <div style={styles.emptyContainer} className="glass-panel">
              <p>ไม่พบมังงะภาษาอังกฤษที่ตรงกับ "{searchQuery}" กรุณาลองใช้คำค้นหาอื่น</p>
            </div>
          ) : (
            <div className="manga-grid">
              {searchResults.map((manga) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  isBookmarked={bookmarks.some(b => b.id === manga.id)}
                  onToggleBookmark={onToggleBookmark}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* HERO HERO FEATURED RECOMMENDED MANGA (only show if not searching) */}
      {!searchQuery && featuredManga && (
        <div className="glass-panel accent-glow-purple" style={{
          ...styles.heroCard,
          backgroundImage: `linear-gradient(${isMobile ? 'to bottom, rgba(6, 8, 20, 0.95) 60%, rgba(6, 8, 20, 0.6) 100%' : 'to right, rgba(6, 8, 20, 0.95) 40%, rgba(6, 8, 20, 0.4) 100%'}, url(${featuredManga.coverUrl})`,
          ...(isMobile ? {
            height: 'auto',
            padding: '20px',
            backgroundPosition: 'center center',
          } : {})
        }}>
          <div style={styles.heroContent}>
            <span style={styles.heroBadge} className="badge badge-purple">ผลงานแนะนำ</span>
            <h1 style={{
              ...styles.heroTitle,
              ...(isMobile ? { fontSize: '1.6rem' } : {})
            }}>{featuredManga.title}</h1>
            <p style={styles.heroJapanese}>{featuredManga.japaneseTitle}</p>
            <p style={styles.heroDesc}>{featuredManga.description.substring(0, 240)}...</p>
            <div style={styles.heroTags}>
              {featuredManga.tags.map(t => (
                <span key={t} className="badge badge-cyan" style={{ fontSize: '0.7rem' }}>{t}</span>
              ))}
            </div>
            <div style={{
              ...styles.heroActions,
              ...(isMobile ? { flexDirection: 'column', width: '100%', gap: '8px' } : {})
            }}>
              <button className="btn btn-primary" onClick={() => handleOpenDetails(featuredManga)} style={isMobile ? { width: '100%' } : {}}>
                ดูรายการตอนภาษาอังกฤษ
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => onToggleBookmark(featuredManga)}
                style={{ 
                  background: bookmarks.some(b => b.id === featuredManga.id) ? 'rgba(239, 68, 68, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                  ...(isMobile ? { width: '100%' } : {})
                }}
              >
                {bookmarks.some(b => b.id === featuredManga.id) ? '❤️ บันทึกแล้ว' : '🤍 บันทึกมังงะ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* RECOMMENDED SECTION (only show if not searching) */}
      {!searchQuery && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>มังงะแนะนำสำหรับคุณ</h2>
          {isLoadingRecs ? (
            <div style={styles.loadingContainer}>
              <span className="loading-spinner" style={styles.spinner}></span>
              <span>กำลังโหลดมังงะแนะนำ...</span>
            </div>
          ) : (
            <div className="manga-grid">
              {recommendations.slice(1).map((manga) => (
                <MangaCard
                  key={manga.id}
                  manga={manga}
                  isBookmarked={bookmarks.some(b => b.id === manga.id)}
                  onToggleBookmark={onToggleBookmark}
                  onOpenDetails={handleOpenDetails}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* DETAILS & CHAPTER MODAL */}
      {selectedManga && (
        <div style={{
          ...styles.modalOverlay,
          ...(isMobile ? { padding: '8px' } : {})
        }} onClick={() => setSelectedManga(null)}>
          <div style={{
            ...styles.modalContent,
            ...(isMobile ? { padding: '16px', maxHeight: '95vh' } : {})
          }} className="glass-panel animate-fade-in" onClick={e => e.stopPropagation()}>
            <button style={styles.closeModalBtn} onClick={() => setSelectedManga(null)}>✕</button>
            
            <div style={{
              ...styles.modalBody,
              ...(isMobile ? { flexDirection: 'column', gap: '16px' } : {})
            }}>
              {/* Left Column: Cover */}
              <div style={{
                ...styles.modalLeft,
                ...(isMobile ? { width: '150px', alignSelf: 'center' } : {})
              }}>
                <img src={selectedManga.coverUrl} alt={selectedManga.title} style={styles.modalCover} />
                <button 
                  className="btn btn-secondary" 
                  onClick={() => onToggleBookmark(selectedManga)}
                  style={{ 
                    width: '100%', 
                    marginTop: '16px',
                    borderColor: bookmarks.some(b => b.id === selectedManga.id) ? 'rgba(239, 68, 68, 0.4)' : 'var(--border-color)',
                    color: bookmarks.some(b => b.id === selectedManga.id) ? '#f87171' : 'var(--text-main)'
                  }}
                >
                  {bookmarks.some(b => b.id === selectedManga.id) ? '❤️ บันทึกในคลังแล้ว' : '🤍 บันทึกมังงะ'}
                </button>
              </div>

              {/* Right Column: Info & Chapters */}
              <div style={styles.modalRight}>
                <h2 style={{
                  ...styles.modalTitle,
                  ...(isMobile ? { fontSize: '1.3rem', paddingRight: '24px' } : {})
                }}>{selectedManga.title}</h2>
                {selectedManga.japaneseTitle && <p style={styles.modalJapanese}>{selectedManga.japaneseTitle}</p>}
                
                <div style={styles.modalTags}>
                  <span className={`badge ${selectedManga.status === 'ongoing' ? 'badge-cyan' : 'badge-purple'}`} style={{ marginRight: '8px' }}>
                    {selectedManga.status === 'ongoing' ? 'กำลังแต่ง' : 'จบแล้ว'}
                  </span>
                  {selectedManga.tags.map(t => (
                    <span key={t} style={styles.modalTagItem}>{t}</span>
                  ))}
                </div>

                <p style={styles.modalDesc}>{selectedManga.description}</p>
                
                <div style={styles.chapterSection}>
                  <h3 style={styles.chapterHeader}>ตอนภาษาอังกฤษที่พร้อมอ่าน (MangaDex)</h3>
                  {isLoadingChapters ? (
                    <div style={styles.chapterLoading}>
                      <span className="loading-spinner" style={styles.spinner}></span>
                      <span>กำลังโหลดรายการตอน...</span>
                    </div>
                  ) : chapters.length === 0 ? (
                    <div style={styles.chapterEmpty}>
                      <p>ไม่พบตอนมังงะภาษาอังกฤษบน MangaDex สำหรับเรื่องนี้</p>
                    </div>
                  ) : isMobile ? (
                    /* Mobile card-based listing */
                    <div style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                      maxHeight: '320px',
                      overflowY: 'auto',
                      paddingRight: '4px',
                    }}>
                      {chapters.map((ch) => {
                        const job = getChapterJob(ch.id);
                        return (
                          <div key={ch.id} style={{
                            background: 'rgba(255, 255, 255, 0.02)',
                            border: '1px solid rgba(255, 255, 255, 0.05)',
                            borderRadius: '8px',
                            padding: '12px 14px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                          }} className="glass-panel">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ color: 'var(--accent-cyan)', fontWeight: '800', fontSize: '0.9rem' }}>Ch. {ch.chapter}</span>
                              <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{ch.pages} หน้า</span>
                            </div>
                            {ch.title && <div style={{ fontSize: '0.8rem', color: '#fff' }}>{ch.title}</div>}
                            <div style={{ marginTop: '4px' }}>
                              {job ? (
                                job.status === 'completed' ? (
                                  <button 
                                    className="btn btn-cyan" 
                                    style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                                    onClick={() => {
                                      setSelectedManga(null);
                                      onViewChapter(job);
                                    }}
                                  >
                                    📖 อ่านตอนนี้
                                  </button>
                                ) : (
                                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                                    <span style={styles.progressStatus}>
                                      <span className="loading-spinner" style={{...styles.spinner, width: '12px', height: '12px'}}></span>
                                      <span style={{color: 'var(--accent-orange)'}}>{job.status.toUpperCase()} ({job.progress}%)</span>
                                    </span>
                                  </div>
                                )
                              ) : (
                                <button 
                                  className="btn btn-primary" 
                                  style={{ width: '100%', padding: '8px', fontSize: '0.8rem' }}
                                  onClick={() => onStartDownload(selectedManga, ch)}
                                >
                                  📖 แปลและอ่าน (AI)
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* Desktop table listing */
                    <div style={styles.chapterTableWrapper}>
                      <table style={styles.chapterTable}>
                        <thead>
                          <tr>
                            <th style={styles.th}>ตอนที่</th>
                            <th style={styles.th}>ชื่อตอน</th>
                            <th style={styles.th}>จำนวนหน้า</th>
                            <th style={styles.th}>ช่องทางอ่านแปลไทย (AI)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {chapters.map((ch) => {
                            const job = getChapterJob(ch.id);
                            return (
                              <tr key={ch.id} style={styles.tr}>
                                <td style={styles.tdNum}>Ch. {ch.chapter}</td>
                                <td style={styles.tdTitle}>{ch.title}</td>
                                <td style={styles.tdPages}>{ch.pages} หน้า</td>
                                <td style={styles.tdAction}>
                                  {job ? (
                                    job.status === 'completed' ? (
                                      <button 
                                        className="btn btn-cyan" 
                                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                        onClick={() => {
                                          setSelectedManga(null);
                                          onViewChapter(job);
                                        }}
                                      >
                                        📖 อ่านแปลไทย (AI)
                                      </button>
                                    ) : (
                                      <span style={styles.progressStatus}>
                                        <span className="loading-spinner" style={{...styles.spinner, width: '12px', height: '12px'}}></span>
                                        <span style={{color: 'var(--accent-orange)'}}>{job.status === 'completed' ? 'เสร็จสิ้น' : job.status.toUpperCase()} ({job.progress}%)</span>
                                      </span>
                                    )
                                  ) : (
                                    <button 
                                      className="btn btn-primary" 
                                      style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                                      onClick={() => onStartDownload(selectedManga, ch)}
                                    >
                                      📖 แปลและอ่าน (AI)
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Subcomponent: MangaCard
function MangaCard({ manga, isBookmarked, onToggleBookmark, onOpenDetails }) {
  return (
    <div className="glass-panel" style={styles.cardContainer}>
      <div style={styles.cardCoverWrapper}>
        <img src={manga.coverUrl} alt={manga.title} style={styles.cardCover} />
        <button 
          style={{
            ...styles.bookmarkBtn,
            background: isBookmarked ? 'rgba(239, 68, 68, 0.8)' : 'rgba(15, 23, 42, 0.6)'
          }}
          onClick={(e) => {
            e.stopPropagation();
            onToggleBookmark(manga);
          }}
        >
          {isBookmarked ? '❤️' : '🤍'}
        </button>
        <span style={styles.cardStatus} className={`badge ${manga.status === 'ongoing' ? 'badge-cyan' : 'badge-purple'}`}>
          {manga.status === 'ongoing' ? 'กำลังแต่ง' : 'จบแล้ว'}
        </span>
      </div>
      <div style={styles.cardContent}>
        <h3 style={styles.cardTitle} title={manga.title}>{manga.title}</h3>
        {manga.japaneseTitle && <p style={styles.cardJapanese}>{manga.japaneseTitle}</p>}
        <div style={styles.cardTags}>
          {manga.tags.slice(0, 2).map(t => (
            <span key={t} style={styles.cardTagItem}>{t}</span>
          ))}
        </div>
        <button className="btn btn-secondary" style={styles.cardActionBtn} onClick={() => onOpenDetails(manga)}>
          ดูรายการตอน
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    paddingTop: '20px',
    paddingBottom: '60px',
  },
  searchBarContainer: {
    padding: '16px 24px',
    marginBottom: '32px',
    background: 'rgba(13, 17, 39, 0.5)',
  },
  searchForm: {
    display: 'flex',
    gap: '16px',
  },
  searchWrapper: {
    position: 'relative',
    flex: 1,
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    color: 'var(--text-muted)',
    fontSize: '1rem',
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    background: 'rgba(8, 10, 26, 0.9)',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
  },
  clearBtn: {
    position: 'absolute',
    right: '16px',
    background: 'none',
    border: 'none',
    color: 'var(--text-muted)',
    cursor: 'pointer',
    fontSize: '0.9rem',
  },
  searchBtn: {
    minWidth: '120px',
  },
  section: {
    marginBottom: '48px',
    textAlign: 'left',
  },
  sectionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#fff',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '48px 0',
    color: 'var(--text-muted)',
  },
  emptyContainer: {
    padding: '40px',
    textAlign: 'center',
    color: 'var(--text-muted)',
  },
  spinner: {
    width: '24px',
    height: '24px',
    border: '2px solid rgba(255, 255, 255, 0.1)',
    borderTopColor: 'var(--accent-cyan)',
    borderRadius: '50%',
    animation: 'spin 0.6s linear infinite',
  },
  // Hero styles
  heroCard: {
    height: '380px',
    backgroundSize: 'cover',
    backgroundPosition: 'center 20%',
    borderRadius: '16px',
    display: 'flex',
    alignItems: 'center',
    padding: '40px',
    textAlign: 'left',
    marginBottom: '48px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroContent: {
    maxWidth: '600px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    zIndex: 2,
  },
  heroBadge: {
    alignSelf: 'flex-start',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: '800',
    lineHeight: '1.1',
    color: '#fff',
    textShadow: '0 2px 10px rgba(0,0,0,0.5)',
  },
  heroJapanese: {
    fontSize: '1rem',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
  },
  heroDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    lineHeight: '1.5',
  },
  heroTags: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  heroActions: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
  },
  // Card styles
  cardContainer: {
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--bg-card)',
    overflow: 'hidden',
    height: '100%',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  },
  cardCoverWrapper: {
    position: 'relative',
    width: '100%',
    paddingTop: '135%', // 3:4 aspect ratio
    overflow: 'hidden',
    background: 'rgba(0,0,0,0.2)',
  },
  cardCover: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    transition: 'transform 0.5s ease',
  },
  bookmarkBtn: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    border: 'none',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: '0.2s',
  },
  cardStatus: {
    position: 'absolute',
    bottom: '12px',
    left: '12px',
    fontSize: '0.65rem',
  },
  cardContent: {
    padding: '16px',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    textAlign: 'left',
    gap: '8px',
  },
  cardTitle: {
    fontSize: '0.95rem',
    fontWeight: '700',
    color: '#fff',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardJapanese: {
    fontSize: '0.75rem',
    color: 'var(--accent-purple)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  cardTags: {
    display: 'flex',
    gap: '6px',
    overflow: 'hidden',
  },
  cardTagItem: {
    fontSize: '0.65rem',
    background: 'rgba(255,255,255,0.05)',
    padding: '2px 6px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
  },
  cardActionBtn: {
    width: '100%',
    padding: '8px',
    fontSize: '0.8rem',
    marginTop: 'auto',
  },
  // Modal styles
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(4, 5, 12, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '24px',
  },
  modalContent: {
    width: '100%',
    maxWidth: '1000px',
    maxHeight: '90vh',
    background: 'rgba(10, 12, 30, 0.95)',
    border: '1px solid rgba(157, 78, 221, 0.3)',
    borderRadius: '16px',
    position: 'relative',
    overflowY: 'auto',
    padding: '36px',
  },
  closeModalBtn: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255,255,255,0.05)',
    border: 'none',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    color: 'var(--text-muted)',
    fontSize: '1rem',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: '0.2s',
  },
  modalBody: {
    display: 'flex',
    gap: '32px',
    textAlign: 'left',
    flexDirection: 'row',
  },
  modalLeft: {
    width: '240px',
    flexShrink: 0,
  },
  modalCover: {
    width: '100%',
    borderRadius: '8px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
  },
  modalRight: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  modalTitle: {
    fontSize: '1.8rem',
    color: '#fff',
    paddingRight: '40px',
  },
  modalJapanese: {
    fontSize: '1rem',
    color: 'var(--accent-cyan)',
    fontWeight: '600',
    marginTop: '-8px',
  },
  modalTags: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px',
  },
  modalTagItem: {
    fontSize: '0.7rem',
    background: 'rgba(255, 255, 255, 0.08)',
    padding: '3px 8px',
    borderRadius: '4px',
    color: 'var(--text-muted)',
  },
  modalDesc: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    lineHeight: '1.6',
    maxHeight: '120px',
    overflowY: 'auto',
    background: 'rgba(255,255,255,0.02)',
    padding: '12px',
    borderRadius: '6px',
    border: '1px solid rgba(255,255,255,0.02)',
  },
  chapterSection: {
    marginTop: '16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  chapterHeader: {
    fontSize: '1.05rem',
    color: '#fff',
    borderBottom: '1px solid rgba(255,255,255,0.1)',
    paddingBottom: '8px',
  },
  chapterLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '24px 0',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  chapterEmpty: {
    padding: '20px 0',
    color: 'var(--text-muted)',
    fontSize: '0.9rem',
  },
  chapterTableWrapper: {
    maxHeight: '300px',
    overflowY: 'auto',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
  },
  chapterTable: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: '0.85rem',
  },
  th: {
    background: 'rgba(8, 10, 26, 0.9)',
    color: 'var(--text-muted)',
    textAlign: 'left',
    padding: '10px 16px',
    fontWeight: '600',
    position: 'sticky',
    top: 0,
    borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
  },
  tr: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    transition: '0.2s',
  },
  tdNum: {
    padding: '12px 16px',
    color: 'var(--accent-cyan)',
    fontWeight: '700',
  },
  tdTitle: {
    padding: '12px 16px',
    color: '#fff',
  },
  tdPages: {
    padding: '12px 16px',
    color: 'var(--text-muted)',
  },
  tdAction: {
    padding: '12px 16px',
    textAlign: 'right',
  },
  progressStatus: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '0.75rem',
  },
};

// MangaDex API Utility with Mock Fallbacks

const API_BASE = 'https://api.mangadex.org';

// Real MangaDex covers & details for fallback/recommended mangas
const MOCK_MANGAS = [
  {
    id: 'b0b721ff-c388-4486-aa0e-ceec0bc4d5f4',
    title: 'Frieren: Beyond Journey\'s End',
    japaneseTitle: '葬送のフリーレン',
    description: 'The adventure is over but life goes on for an elf mage who\'s just beginning to learn what life is all about. Elf mage Frieren and her courageous fellow adventurers have defeated the Demon King and brought peace to the land. But Frieren will long outlive the rest of her former party. How will she come to understand what life means to the humans around her?',
    coverUrl: 'https://uploads.mangadex.org/covers/b0b721ff-c388-4486-aa0e-ceec0bc4d5f4/8029c04a-b5e1-4560-b633-9114f0436a51.jpg.256.jpg',
    status: 'ongoing',
    tags: ['Adventure', 'Drama', 'Fantasy', 'Shounen', 'Slice of Life'],
  },
  {
    id: 'a77742b1-8169-4f21-954f-2c0c5914ab74',
    title: 'Chainsaw Man',
    japaneseTitle: 'チェンソーマン',
    description: 'Denji is a teenage boy living with a Chainsaw Devil named Pochita. Due to the debt his father left behind, he has been living a rock-bottom life while repaying his debt by harvesting devil corpses with Pochita. One day, Denji is betrayed and killed. As his consciousness fades, he makes a contract with Pochita and gets revived as "Chainsaw Man" — a man with a devil\'s heart.',
    coverUrl: 'https://uploads.mangadex.org/covers/a77742b1-8169-4f21-954f-2c0c5914ab74/96924619-3738-4e12-b91c-799ff248408a.png.256.jpg',
    status: 'ongoing',
    tags: ['Action', 'Comedy', 'Drama', 'Horror', 'Supernatural', 'Shounen'],
  },
  {
    id: '2bd2e8d5-c146-46c3-a371-3ab0c5d6816e',
    title: 'Oshi no Ko',
    japaneseTitle: '【推しの子】',
    description: 'Gorou Honda is a gynecologist in a rural area who is a massive fan of the idol Ai Hoshino. When Ai suddenly takes a hiatus and appears at his clinic pregnant, Gorou is shocked but promises to deliver her babies safely. However, right before the birth, he is murdered by an obsessive stalker. Gorou wakes up to find himself reborn as Ai\'s newborn son, Aquamarine Hoshino, with his memories intact.',
    coverUrl: 'https://uploads.mangadex.org/covers/2bd2e8d5-c146-46c3-a371-3ab0c5d6816e/6c5f7253-1577-4b71-aa1e-080c320d753c.jpg.256.jpg',
    status: 'completed',
    tags: ['Drama', 'Mystery', 'Supernatural', 'Psychological', 'Reincarnation'],
  },
  {
    id: '32ae704a-ad59-467b-9749-6dd7cfab26e5',
    title: 'Solo Leveling',
    japaneseTitle: '나 혼자만 레벨업',
    description: 'In a world where hunters must battle deadly monsters to protect mankind, Sung Jin-Woo, nicknamed "the weakest hunter of all mankind," finds himself in a struggle for survival in a double dungeon. Mysteriously surviving after a near-fatal event, he acquires a unique interface that allows him to level up infinitely, starting his journey to become the strongest hunter.',
    coverUrl: 'https://uploads.mangadex.org/covers/32ae704a-ad59-467b-9749-6dd7cfab26e5/1583d7aa-d652-475b-b9f4-279549303d8d.jpg.256.jpg',
    status: 'completed',
    tags: ['Action', 'Adventure', 'Fantasy', 'System', 'Overpowered'],
  },
  {
    id: 'c438ad4b-2bdf-4bc3-95c2-f1e1a5a0fdd5',
    title: 'Spy x Family',
    japaneseTitle: 'SPY×FAMILY',
    description: 'For the agent known as "Twilight," no order is too tall for the sake of peace. Twilight operates under the alias Loid Forger, a psychiatrist, and adopts a telepathic orphan girl named Anya and marries an assassin named Yor. Unbeknownst to each other, they play out a simulated happy family while maintaining their secret identities to complete Twilight\'s critical mission.',
    coverUrl: 'https://uploads.mangadex.org/covers/c438ad4b-2bdf-4bc3-95c2-f1e1a5a0fdd5/160d5bfa-fa65-4f35-ab35-263a2334e321.jpg.256.jpg',
    status: 'ongoing',
    tags: ['Action', 'Comedy', 'Drama', 'Slice of Life', 'Shounen'],
  }
];

// Helper to generate mock chapters if API fails
const generateMockChapters = (mangaId) => {
  const chapters = [];
  for (let i = 1; i <= 15; i++) {
    chapters.push({
      id: `${mangaId}-ch-${i}`,
      chapter: i.toString(),
      title: `Simulated Chapter ${i}: The Beginning of Translation`,
      pages: Math.floor(Math.random() * 10) + 12,
      publishAt: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return chapters;
};

// Helper: Extract cover art from relationships
const getCoverUrl = (mangaId, relationships) => {
  const coverObj = relationships.find(r => r.type === 'cover_art');
  if (coverObj && coverObj.attributes && coverObj.attributes.fileName) {
    return `https://uploads.mangadex.org/covers/${mangaId}/${coverObj.attributes.fileName}.256.jpg`;
  }
  // Try to find if we already have it in MOCK
  const matchedMock = MOCK_MANGAS.find(m => m.id === mangaId);
  if (matchedMock) return matchedMock.coverUrl;
  
  return 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=256&auto=format&fit=crop&q=60'; // Anime illustration placeholder
};

export const fetchRecommendations = async () => {
  try {
    // Attempt to fetch from MangaDex
    const idsString = MOCK_MANGAS.map(m => m.id);
    const queryParams = idsString.map(id => `ids[]=${id}`).join('&');
    const response = await fetch(`${API_BASE}/manga?${queryParams}&includes[]=cover_art`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });
    
    if (!response.ok) throw new Error('API request failed');
    
    const result = await response.json();
    return result.data.map(manga => {
      const titleObj = manga.attributes.title;
      const title = titleObj.en || titleObj['ja-ro'] || Object.values(titleObj)[0];
      const descObj = manga.attributes.description;
      const description = descObj.en || Object.values(descObj)[0] || 'No description available.';
      const status = manga.attributes.status;
      const tags = manga.attributes.tags.map(t => t.attributes.name.en).slice(0, 5);
      const coverUrl = getCoverUrl(manga.id, manga.relationships);
      
      // Try to get Japanese title for styling
      const altTitles = manga.attributes.altTitles || [];
      const jaTitleObj = altTitles.find(t => t.ja || t['ja-ro']);
      const japaneseTitle = jaTitleObj ? (jaTitleObj.ja || jaTitleObj['ja-ro']) : (MOCK_MANGAS.find(m => m.id === manga.id)?.japaneseTitle || '');

      return {
        id: manga.id,
        title,
        japaneseTitle,
        description,
        coverUrl,
        status,
        tags
      };
    });
  } catch (error) {
    console.warn('MangaDex API failed, loading mock recommendations:', error);
    return MOCK_MANGAS;
  }
};

export const searchManga = async (query) => {
  if (!query || query.trim() === '') {
    return fetchRecommendations();
  }

  try {
    const response = await fetch(
      `${API_BASE}/manga?title=${encodeURIComponent(query)}&limit=15&includes[]=cover_art&contentRating[]=safe&contentRating[]=suggestive`,
      { method: 'GET' }
    );
    
    if (!response.ok) throw new Error('API search failed');
    
    const result = await response.json();
    if (result.data.length === 0) return [];

    return result.data.map(manga => {
      const titleObj = manga.attributes.title;
      const title = titleObj.en || titleObj['ja-ro'] || Object.values(titleObj)[0];
      const descObj = manga.attributes.description;
      const description = descObj.en || Object.values(descObj)[0] || 'No description available.';
      const status = manga.attributes.status;
      const tags = manga.attributes.tags.map(t => t.attributes.name.en).slice(0, 4);
      const coverUrl = getCoverUrl(manga.id, manga.relationships);
      
      const altTitles = manga.attributes.altTitles || [];
      const jaTitleObj = altTitles.find(t => t.ja || t['ja-ro']);
      const japaneseTitle = jaTitleObj ? (jaTitleObj.ja || jaTitleObj['ja-ro']) : '';

      return {
        id: manga.id,
        title,
        japaneseTitle,
        description,
        coverUrl,
        status,
        tags
      };
    });
  } catch (error) {
    console.warn('MangaDex search failed, filtering mock data:', error);
    // Local filter on mocks
    return MOCK_MANGAS.filter(m => 
      m.title.toLowerCase().includes(query.toLowerCase()) || 
      m.tags.some(t => t.toLowerCase().includes(query.toLowerCase()))
    );
  }
};

export const fetchChapters = async (mangaId) => {
  try {
    // Translated language: English only
    const response = await fetch(
      `${API_BASE}/manga/${mangaId}/feed?translatedLanguage[]=en&limit=100&order[chapter]=asc`,
      { method: 'GET' }
    );
    
    if (!response.ok) throw new Error('API chapters failed');
    
    const result = await response.json();
    
    // Group and filter duplicates of the same chapter number to keep the list clean
    const seenChapters = new Set();
    const cleanChapters = [];
    
    for (const ch of result.data) {
      const chNum = ch.attributes.chapter || '0';
      if (!seenChapters.has(chNum)) {
        seenChapters.add(chNum);
        cleanChapters.push({
          id: ch.id,
          chapter: chNum,
          title: ch.attributes.title || `Chapter ${chNum}`,
          pages: ch.attributes.pages || 16,
          publishAt: ch.attributes.publishAt
        });
      }
    }
    
    // Sort chronologically by chapter number (numerical sort)
    return cleanChapters.sort((a, b) => {
      const numA = parseFloat(a.chapter) || 0;
      const numB = parseFloat(b.chapter) || 0;
      return numA - numB;
    });
  } catch (error) {
    console.warn(`MangaDex fetch chapters failed for ${mangaId}, using mocks:`, error);
    return generateMockChapters(mangaId);
  }
};

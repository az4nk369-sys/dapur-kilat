// Dapur Kilat — every tuning number and colour in one place. The playfield is a
// fixed 1280x720 logical area; the renderer scales it to the window, so no rule
// below depends on the screen size.
export const FIELD = { width: 1280, height: 720 };

/** The simulation's fixed step, in seconds: 60 updates a second whatever the display's rate. */
export const STEP = 1 / 60;

/** One shift lasts this long; when the timer hits zero the shift is over. */
export const SHIFT_SECONDS = 120;

/** Hearts: a lost customer costs one; at zero the shift ends early. */
export const HEARTS = 3;

/** Seconds of play per level; each level orders arrive faster. */
export const LEVEL = { seconds: 30, max: 5 };

/** How long a ticket waits before the customer walks out. */
export const PATIENCE = 30;

/** Seconds a wok needs to cook a full recipe. */
export const COOK_SECONDS = 4;

/** Chops needed to prepare an ingredient that needs chopping. */
export const CHOPS_NEEDED = 3;

/** Plate slots on the pass. */
export const PLATES = 2;

/** At most this many tickets wait on the order board. */
export const MAX_TICKETS = 4;

/** Ingredients, in counter order. `chop` means it must be chopped on the board first. */
export const INGREDIENTS = [
  { id: 'nasi', name: 'Nasi', key: '1', chop: false, color: '#f5efe0', accent: '#d9c9a3' },
  { id: 'mie', name: 'Mie', key: '2', chop: false, color: '#f2c14e', accent: '#c98f1b' },
  { id: 'ayam', name: 'Ayam', key: '3', chop: true, color: '#e8a06a', accent: '#b25b2a' },
  { id: 'telur', name: 'Telur', key: '4', chop: false, color: '#fff3c4', accent: '#e8a90c' },
  { id: 'sayur', name: 'Sayur', key: '5', chop: true, color: '#7dc383', accent: '#3e7d44' },
  { id: 'kecap', name: 'Kecap', key: '6', chop: false, color: '#4a2c1a', accent: '#2b1808' },
  { id: 'sambal', name: 'Sambal', key: '7', chop: false, color: '#d43d2a', accent: '#8f1d12' },
];

export const INGREDIENT_BY_ID = Object.fromEntries(INGREDIENTS.map((i) => [i.id, i]));

/** Recipes: each dish is three ingredients, in any order. */
export const RECIPES = [
  { id: 'nasi-goreng', name: 'Nasi Goreng', price: 18, needs: ['nasi', 'telur', 'kecap'] },
  { id: 'mie-goreng', name: 'Mie Goreng', price: 20, needs: ['mie', 'ayam', 'sayur'] },
  { id: 'sate-ayam', name: 'Sate Ayam', price: 24, needs: ['ayam', 'sambal', 'kecap'] },
  { id: 'cap-cay', name: 'Cap Cay', price: 22, needs: ['sayur', 'ayam', 'telur'] },
];

export const RECIPE_BY_ID = Object.fromEntries(RECIPES.map((r) => [r.id, r]));

/** Tip for serving fast: up to this many coins on top of the dish price. */
export const MAX_TIP = 10;

export const PALETTE = {
  wall: '#3b2a1e',
  wallTile: '#4a3527',
  floor: '#2c211a',
  counter: '#8a5a33',
  counterTop: '#a9743f',
  board: '#2e2118',
  boardEdge: '#6b4a2c',
  ticket: '#fdf3d8',
  ticketEdge: '#d9c08a',
  wok: '#3a3f46',
  wokInner: '#22252a',
  stove: '#1c1e22',
  plate: '#f2ede2',
  text: '#f5efe0',
  dark: '#241a12',
  muted: '#b9a58c',
  gold: '#f2c14e',
  red: '#d43d2a',
  green: '#7dc383',
  panel: '#241a12',
};

export const FONT = 'system-ui, -apple-system, "Segoe UI", sans-serif';

/** Where the best score is kept between visits (this browser only). */
export const BEST_KEY = 'dapur-kilat-best';

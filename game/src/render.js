// Dapur Kilat's look: one canvas, everything drawn in code — no image files.
// The kitchen, the order board, the counter, the wok, the plates and the food
// are all vector shapes, so the screenshots are the game itself.
import {
  FIELD,
  FONT,
  INGREDIENTS,
  INGREDIENT_BY_ID,
  PALETTE,
  RECIPE_BY_ID,
} from './config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_PAUSED = 'paused';
export const SCREEN_OVER = 'over';

const TOP_H = 64;
const BOARD = { x: 20, y: 84, w: 310, h: 340 };
const KITCHEN = { x: 350, y: 84, w: 580, h: 476 };
const PASS = { x: 950, y: 84, w: 310, h: 340 };
const COUNTER = { x: 20, y: 580, w: 1240, h: 120 };
const WOK = { x: 640, y: 400, r: 96 };
const CHOP_BOARD = { x: 430, y: 430, w: 150, h: 90 };
const TRASH = { x: 830, y: 440, w: 84, h: 84 };

/** Clickable rectangles, shared with the input layer. */
export function zones() {
  const bins = INGREDIENTS.map((ing, i) => ({
    kind: 'ingredient',
    id: ing.id,
    x: COUNTER.x + 14 + i * 174,
    y: COUNTER.y + 14,
    w: 160,
    h: 92,
  }));
  return {
    bins,
    board: { kind: 'board', ...CHOP_BOARD },
    wok: { kind: 'wok', x: WOK.x - WOK.r, y: WOK.y - WOK.r, w: WOK.r * 2, h: WOK.r * 2 },
    trash: { kind: 'trash', ...TRASH },
    plates: [0, 1].map((i) => ({
      kind: 'plate',
      index: i,
      x: PASS.x + 30 + i * 140,
      y: PASS.y + 90,
      w: 120,
      h: 120,
    })),
    tickets: [0, 1, 2, 3].map((i) => ({
      kind: 'ticket',
      index: i,
      x: BOARD.x + 12,
      y: BOARD.y + 44 + i * 72,
      w: BOARD.w - 24,
      h: 64,
    })),
  };
}

function rr(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function text(ctx, str, x, y, size, color, align = 'left', weight = '700') {
  ctx.fillStyle = color;
  ctx.font = `${weight} ${size}px ${FONT}`;
  ctx.textAlign = align;
  ctx.textBaseline = 'middle';
  ctx.fillText(str, x, y);
}

function mmss(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

/** One ingredient's little picture, drawn in code. */
export function drawIngredient(ctx, id, x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  if (id === 'nasi') {
    ctx.fillStyle = '#c96f3f';
    ctx.beginPath();
    ctx.arc(0, r * 0.15, r * 0.9, 0, Math.PI);
    ctx.fill();
    ctx.fillRect(-r * 0.9, r * 0.1, r * 1.8, r * 0.3);
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath();
    ctx.arc(0, 2, r * 0.85, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff';
    for (let i = -2; i <= 2; i += 1) {
      ctx.beginPath();
      ctx.arc(i * r * 0.3, -r * 0.35 - Math.abs(i) * -r * 0.08, r * 0.16, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (id === 'mie') {
    ctx.strokeStyle = '#f2c14e';
    ctx.lineWidth = r * 0.22;
    ctx.lineCap = 'round';
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.7, i * r * 0.4);
      ctx.bezierCurveTo(-r * 0.3, i * r * 0.4 - r * 0.5, r * 0.3, i * r * 0.4 + r * 0.5, r * 0.7, i * r * 0.4);
      ctx.stroke();
    }
  } else if (id === 'ayam') {
    ctx.fillStyle = '#e8a06a';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.62, r * 0.55, 0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#f5efe0';
    ctx.lineWidth = r * 0.16;
    ctx.beginPath();
    ctx.moveTo(r * 0.35, r * 0.35);
    ctx.lineTo(r * 0.8, r * 0.8);
    ctx.moveTo(r * 0.5, r * 0.2);
    ctx.lineTo(r * 0.85, r * 0.6);
    ctx.stroke();
    ctx.fillStyle = '#b25b2a';
    ctx.beginPath();
    ctx.arc(-r * 0.15, -r * 0.25, r * 0.18, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'telur') {
    ctx.fillStyle = '#fff3c4';
    ctx.beginPath();
    ctx.ellipse(0, 0, r * 0.9, r * 0.7, 0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8a90c';
    ctx.beginPath();
    ctx.arc(r * 0.1, -r * 0.05, r * 0.42, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f7c948';
    ctx.beginPath();
    ctx.arc(r * 0.02, -r * 0.12, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
  } else if (id === 'sayur') {
    ctx.fillStyle = '#7dc383';
    for (let i = 0; i < 3; i += 1) {
      const a = -0.6 + i * 0.6;
      ctx.beginPath();
      ctx.ellipse(Math.cos(a) * r * 0.45, Math.sin(a) * r * 0.45 - r * 0.05, r * 0.62, r * 0.3, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#3e7d44';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3e7d44';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(0, r * 0.5);
    ctx.lineTo(0, r * 0.9);
    ctx.stroke();
  } else if (id === 'kecap') {
    ctx.fillStyle = '#4a2c1a';
    rr(ctx, -r * 0.4, -r * 0.5, r * 0.8, r * 1.3, r * 0.2);
    ctx.fill();
    ctx.fillStyle = '#2b1808';
    ctx.fillRect(-r * 0.22, -r * 0.95, r * 0.44, r * 0.5);
    ctx.fillStyle = '#f2c14e';
    ctx.fillRect(-r * 0.4, -r * 0.1, r * 0.8, r * 0.45);
    text(ctx, 'KECAP', 0, r * 0.12, Math.round(r * 0.28), '#2b1808', 'center');
  } else if (id === 'sambal') {
    ctx.fillStyle = '#f5efe0';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.85, 0, Math.PI);
    ctx.fill();
    ctx.fillStyle = '#d43d2a';
    ctx.beginPath();
    ctx.ellipse(0, -r * 0.1, r * 0.7, r * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#8f1d12';
    ctx.beginPath();
    ctx.arc(-r * 0.2, -r * 0.2, r * 0.14, 0, Math.PI * 2);
    ctx.arc(r * 0.25, -r * 0.05, r * 0.12, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#3e7d44';
    ctx.lineWidth = r * 0.1;
    ctx.beginPath();
    ctx.moveTo(r * 0.1, -r * 0.5);
    ctx.quadraticCurveTo(r * 0.4, -r * 0.8, r * 0.55, -r * 0.6);
    ctx.stroke();
  }
  ctx.restore();
}

/** A finished dish on a plate, drawn from its recipe. */
export function drawDish(ctx, dishId, x, y, r) {
  const recipe = RECIPE_BY_ID[dishId];
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = PALETTE.plate;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#cfc4a8';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, r * 0.78, 0, Math.PI * 2);
  ctx.stroke();
  if (!recipe) {
    ctx.restore();
    return;
  }
  if (dishId === 'nasi-goreng') {
    ctx.fillStyle = '#e8b64c';
    ctx.beginPath();
    ctx.arc(0, r * 0.1, r * 0.55, Math.PI, 0);
    ctx.fill();
    drawIngredient(ctx, 'telur', r * 0.1, -r * 0.15, r * 0.34);
    ctx.fillStyle = '#d43d2a';
    ctx.beginPath();
    ctx.arc(-r * 0.35, r * 0.25, r * 0.14, 0, Math.PI * 2);
    ctx.fill();
  } else if (dishId === 'mie-goreng') {
    ctx.save();
    ctx.translate(0, r * 0.05);
    drawIngredient(ctx, 'mie', 0, 0, r * 0.62);
    drawIngredient(ctx, 'sayur', -r * 0.3, -r * 0.3, r * 0.3);
    drawIngredient(ctx, 'ayam', r * 0.3, -r * 0.25, r * 0.3);
    ctx.restore();
  } else if (dishId === 'sate-ayam') {
    ctx.strokeStyle = '#c9a06a';
    ctx.lineWidth = 3;
    for (let i = -1; i <= 1; i += 1) {
      ctx.beginPath();
      ctx.moveTo(-r * 0.6, i * r * 0.32);
      ctx.lineTo(r * 0.6, i * r * 0.32);
      ctx.stroke();
    }
    ctx.fillStyle = '#a8642e';
    for (let i = -1; i <= 1; i += 1) {
      for (let j = -1; j <= 1; j += 1) {
        ctx.beginPath();
        ctx.arc(j * r * 0.28, i * r * 0.32, r * 0.17, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    drawIngredient(ctx, 'sambal', r * 0.45, r * 0.45, r * 0.3);
  } else if (dishId === 'cap-cay') {
    drawIngredient(ctx, 'sayur', -r * 0.15, -r * 0.1, r * 0.5);
    drawIngredient(ctx, 'ayam', r * 0.3, r * 0.15, r * 0.38);
    drawIngredient(ctx, 'telur', -r * 0.35, r * 0.3, r * 0.3);
  }
  ctx.restore();
}

export function createRenderer(canvas) {
  canvas.width = FIELD.width;
  canvas.height = FIELD.height;
  const ctx = canvas.getContext('2d');

  function panel(x, y, w, h, fill, edge) {
    ctx.fillStyle = fill;
    rr(ctx, x, y, w, h, 12);
    ctx.fill();
    if (edge) {
      ctx.strokeStyle = edge;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function drawTopBar(s) {
    ctx.fillStyle = PALETTE.wall;
    ctx.fillRect(0, 0, FIELD.width, TOP_H);
    ctx.fillStyle = PALETTE.boardEdge;
    ctx.fillRect(0, TOP_H - 4, FIELD.width, 4);
    text(ctx, '🍳 DAPUR KILAT', 24, TOP_H / 2 + 1, 26, PALETTE.gold);
    text(ctx, `Level ${s.level}`, 250, TOP_H / 2 + 1, 18, PALETTE.muted);
    const timerColor = s.shiftLeft <= 15 ? PALETTE.red : PALETTE.text;
    text(ctx, `⏱ ${mmss(s.shiftLeft)}`, FIELD.width / 2, TOP_H / 2 + 1, 30, timerColor, 'center');
    text(ctx, `🪙 ${s.coins} koin`, FIELD.width - 260, TOP_H / 2 + 1, 20, PALETTE.text, 'right');
    let hearts = '';
    for (let i = 0; i < 3; i += 1) hearts += i < s.hearts ? '❤' : '🖤';
    text(ctx, hearts, FIELD.width - 230, TOP_H / 2 + 1, 20, PALETTE.red, 'left');
    if (s.combo >= 2) text(ctx, `🔥 x${s.combo}`, FIELD.width - 24, TOP_H / 2 + 1, 20, '#ff9f43', 'right');
  }

  function drawBoard(s) {
    panel(BOARD.x, BOARD.y, BOARD.w, BOARD.h, PALETTE.board, PALETTE.boardEdge);
    text(ctx, '📋 PESANAN', BOARD.x + 16, BOARD.y + 22, 18, PALETTE.gold);
    if (s.tickets.length === 0) {
      text(ctx, 'Belum ada pesanan…', BOARD.x + BOARD.w / 2, BOARD.y + 110, 16, PALETTE.muted, 'center');
    }
    s.tickets.forEach((t, i) => {
      const y = BOARD.y + 44 + i * 72;
      const pct = Math.max(0, t.patience / t.maxPatience);
      ctx.fillStyle = PALETTE.ticket;
      rr(ctx, BOARD.x + 12, y, BOARD.w - 24, 64, 8);
      ctx.fill();
      text(ctx, t.name, BOARD.x + 24, y + 16, 17, PALETTE.dark);
      text(ctx, `${t.price} koin`, BOARD.x + BOARD.w - 24, y + 16, 15, '#8a6d1f', 'right');
      t.needs.forEach((id, j) => {
        const ing = INGREDIENT_BY_ID[id];
        ctx.fillStyle = ing.color;
        ctx.beginPath();
        ctx.arc(BOARD.x + 30 + j * 26, y + 44, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = ing.accent;
        ctx.lineWidth = 2;
        ctx.stroke();
        text(ctx, ing.name.slice(0, 1), BOARD.x + 30 + j * 26, y + 44, 11, PALETTE.dark, 'center');
      });
      ctx.fillStyle = '#e3d3ae';
      rr(ctx, BOARD.x + 118, y + 38, BOARD.w - 150, 10, 5);
      ctx.fill();
      ctx.fillStyle = pct > 0.5 ? PALETTE.green : pct > 0.25 ? '#f2c14e' : PALETTE.red;
      rr(ctx, BOARD.x + 118, y + 38, (BOARD.w - 150) * pct, 10, 5);
      ctx.fill();
    });
  }

  function drawKitchen(s, t) {
    panel(KITCHEN.x, KITCHEN.y, KITCHEN.w, KITCHEN.h, '#54402e', PALETTE.boardEdge);
    ctx.fillStyle = '#6b5138';
    for (let x = KITCHEN.x + 10; x < KITCHEN.x + KITCHEN.w - 10; x += 46) {
      ctx.fillRect(x, KITCHEN.y + 10, 40, 60);
    }
    // Stove.
    ctx.fillStyle = PALETTE.stove;
    rr(ctx, WOK.x - 150, WOK.y + 30, 300, 96, 10);
    ctx.fill();
    ctx.fillStyle = '#2a2d33';
    ctx.beginPath();
    ctx.arc(WOK.x, WOK.y + 8, WOK.r + 14, 0, Math.PI * 2);
    ctx.fill();
    // The wok, with its ingredients inside.
    ctx.fillStyle = PALETTE.wok;
    ctx.beginPath();
    ctx.arc(WOK.x, WOK.y, WOK.r, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = PALETTE.wokInner;
    ctx.beginPath();
    ctx.arc(WOK.x, WOK.y, WOK.r - 12, 0, Math.PI * 2);
    ctx.fill();
    s.wok.items.forEach((id, i) => {
      const a = -0.9 + i * 0.9;
      drawIngredient(ctx, id, WOK.x + Math.cos(a) * 42, WOK.y + Math.sin(a) * 30 + 6, 26);
    });
    if (s.wok.cooking) {
      // Steam.
      ctx.strokeStyle = 'rgba(245,239,224,0.7)';
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (let i = 0; i < 3; i += 1) {
        const px = WOK.x - 40 + i * 40;
        const wob = Math.sin(t * 3 + i * 2) * 8;
        ctx.beginPath();
        ctx.moveTo(px, WOK.y - WOK.r - 6);
        ctx.quadraticCurveTo(px + wob, WOK.y - WOK.r - 34, px - wob, WOK.y - WOK.r - 58);
        ctx.stroke();
      }
      // Cook progress bar.
      ctx.fillStyle = '#241a12';
      rr(ctx, WOK.x - 70, WOK.y - WOK.r - 96, 140, 16, 8);
      ctx.fill();
      ctx.fillStyle = '#ff9f43';
      rr(ctx, WOK.x - 70, WOK.y - WOK.r - 96, 140 * Math.min(1, s.wok.progress), 16, 8);
      ctx.fill();
      text(ctx, 'MEMASAK…', WOK.x, WOK.y - WOK.r - 112, 14, '#ff9f43', 'center');
    } else if (s.wok.dish && s.wok.progress >= 1) {
      text(ctx, 'Siap diangkat!', WOK.x, WOK.y - WOK.r - 14, 15, PALETTE.green, 'center');
    } else if (s.wok.items.length > 0) {
      text(ctx, `${s.wok.items.length}/3 bahan — tekan SPASI untuk memasak`, WOK.x, WOK.y - WOK.r - 14, 14, PALETTE.muted, 'center');
    } else {
      text(ctx, 'Wajan kosong — klik bahan di bawah, lalu klik wajan', WOK.x, WOK.y - WOK.r - 14, 14, PALETTE.muted, 'center');
    }
    // Chopping board.
    ctx.fillStyle = '#c9a06a';
    rr(ctx, CHOP_BOARD.x, CHOP_BOARD.y, CHOP_BOARD.w, CHOP_BOARD.h, 8);
    ctx.fill();
    ctx.strokeStyle = '#8a6d3f';
    ctx.lineWidth = 2;
    ctx.stroke();
    text(ctx, 'TALENAN', CHOP_BOARD.x + CHOP_BOARD.w / 2, CHOP_BOARD.y + 16, 13, '#6b4a2c', 'center');
    if (s.hand && INGREDIENT_BY_ID[s.hand.ingredient].chop && !s.hand.chopped) {
      drawIngredient(ctx, s.hand.ingredient, CHOP_BOARD.x + CHOP_BOARD.w / 2, CHOP_BOARD.y + 52, 22);
      const p = s.chopProgress / 3;
      ctx.fillStyle = '#8a6d3f';
      ctx.fillRect(CHOP_BOARD.x + 20, CHOP_BOARD.y + CHOP_BOARD.h - 14, CHOP_BOARD.w - 40, 6);
      ctx.fillStyle = PALETTE.green;
      ctx.fillRect(CHOP_BOARD.x + 20, CHOP_BOARD.y + CHOP_BOARD.h - 14, (CHOP_BOARD.w - 40) * p, 6);
      text(ctx, 'Klik 3x untuk mencincang', CHOP_BOARD.x + CHOP_BOARD.w / 2, CHOP_BOARD.y + CHOP_BOARD.h + 14, 12, PALETTE.muted, 'center');
    } else {
      text(ctx, 'Ayam & Sayur', CHOP_BOARD.x + CHOP_BOARD.w / 2, CHOP_BOARD.y + 44, 13, '#6b4a2c', 'center');
      text(ctx, 'dicincang di sini', CHOP_BOARD.x + CHOP_BOARD.w / 2, CHOP_BOARD.y + 62, 13, '#6b4a2c', 'center');
    }
    // Trash bin.
    ctx.fillStyle = '#5a6270';
    rr(ctx, TRASH.x, TRASH.y, TRASH.w, TRASH.h, 8);
    ctx.fill();
    text(ctx, '🗑', TRASH.x + TRASH.w / 2, TRASH.y + 30, 26, '#fff', 'center');
    text(ctx, 'BUANG', TRASH.x + TRASH.w / 2, TRASH.y + 62, 12, '#fff', 'center');
  }

  function drawPass(s) {
    panel(PASS.x, PASS.y, PASS.w, PASS.h, PALETTE.board, PALETTE.boardEdge);
    text(ctx, '🍽 PIRING SIAP SAJI', PASS.x + 16, PASS.y + 22, 18, PALETTE.gold);
    s.plates.forEach((dish, i) => {
      const cx = PASS.x + 90 + i * 140;
      const cy = PASS.y + 150;
      if (dish) {
        drawDish(ctx, dish, cx, cy, 52);
        text(ctx, RECIPE_BY_ID[dish].name, cx, cy + 72, 14, PALETTE.text, 'center');
        text(ctx, 'Klik piring → klik pesanan', cx, cy + 92, 11, PALETTE.muted, 'center');
      } else {
        ctx.strokeStyle = PALETTE.muted;
        ctx.setLineDash([6, 6]);
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy, 52, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        text(ctx, 'kosong', cx, cy, 14, PALETTE.muted, 'center');
      }
    });
    text(ctx, 'Atau tekan ENTER untuk', PASS.x + PASS.w / 2, PASS.y + 262, 13, PALETTE.muted, 'center');
    text(ctx, 'mengantar otomatis', PASS.x + PASS.w / 2, PASS.y + 282, 13, PALETTE.muted, 'center');
    text(ctx, `Tersaji: ${s.served}  •  Gagal: ${s.missed}`, PASS.x + PASS.w / 2, PASS.y + 314, 14, PALETTE.text, 'center');
  }

  function drawCounter(s, mouse) {
    panel(COUNTER.x, COUNTER.y, COUNTER.w, COUNTER.h, PALETTE.counter, PALETTE.boardEdge);
    text(ctx, 'BAHAN', COUNTER.x + 16, COUNTER.y + 18, 13, '#e8d9b8');
    INGREDIENTS.forEach((ing, i) => {
      const x = COUNTER.x + 14 + i * 174;
      const y = COUNTER.y + 14;
      const held = s.hand && s.hand.ingredient === ing.id;
      ctx.fillStyle = held ? '#f2c14e' : '#6b4a2c';
      rr(ctx, x, y, 160, 92, 10);
      ctx.fill();
      ctx.fillStyle = held ? '#2b1808' : '#f5efe0';
      ctx.fillRect(x + 8, y + 8, 52, 52);
      drawIngredient(ctx, ing.id, x + 34, y + 34, 20);
      text(ctx, ing.name, x + 70, y + 26, 16, held ? '#2b1808' : '#f5efe0');
      text(ctx, ing.chop ? (s.hand && s.hand.ingredient === ing.id && !s.hand.chopped ? 'cincang dulu' : 'perlu cincang') : 'langsung', x + 70, y + 48, 12, held ? '#5a3a1a' : PALETTE.muted);
      text(ctx, `[${ing.key}]`, x + 70, y + 70, 13, held ? '#2b1808' : PALETTE.gold);
    });
    // Held ingredient follows the mouse.
    if (s.hand && mouse) {
      ctx.save();
      ctx.globalAlpha = 0.95;
      ctx.fillStyle = '#241a12';
      ctx.beginPath();
      ctx.arc(mouse.x, mouse.y, 26, 0, Math.PI * 2);
      ctx.fill();
      drawIngredient(ctx, s.hand.ingredient, mouse.x, mouse.y, 18);
      ctx.restore();
      const label = s.hand.chopped ? INGREDIENT_BY_ID[s.hand.ingredient].name : `${INGREDIENT_BY_ID[s.hand.ingredient].name} (mentah)`;
      text(ctx, label, mouse.x, mouse.y + 38, 13, PALETTE.text, 'center');
    }
  }

  function drawFlash(s) {
    if (!s.flash || s.time - s.flashAt > 1.6) return;
    const a = 1 - (s.time - s.flashAt) / 1.6;
    ctx.save();
    ctx.globalAlpha = a;
    text(ctx, s.flash, FIELD.width / 2, 100, 26, PALETTE.gold, 'center');
    ctx.restore();
  }

  function overlay(title, lines, foot, accent) {
    ctx.fillStyle = 'rgba(20,12,6,0.72)';
    ctx.fillRect(0, 0, FIELD.width, FIELD.height);
    panel(FIELD.width / 2 - 330, 120, 660, 420, '#2e2118', PALETTE.boardEdge);
    text(ctx, title, FIELD.width / 2, 176, 44, accent, 'center');
    lines.forEach((line, i) => {
      text(ctx, line, FIELD.width / 2, 240 + i * 32, 18, PALETTE.text, 'center', '400');
    });
    text(ctx, foot, FIELD.width / 2, 500, 20, PALETTE.gold, 'center');
  }

  return {
    draw(state, screen, best, mouse, t) {
      ctx.clearRect(0, 0, FIELD.width, FIELD.height);
      ctx.fillStyle = PALETTE.floor;
      ctx.fillRect(0, 0, FIELD.width, FIELD.height);
      drawTopBar(state);
      drawBoard(state);
      drawKitchen(state, t ?? state.time);
      drawPass(state);
      drawCounter(state, screen === SCREEN_PLAY ? mouse : null);
      drawFlash(state);
      if (screen === SCREEN_TITLE) {
        overlay('🍳 DAPUR KILAT', [
          'Warung masakan cepat saji — layani pesanan sebelum pelanggan pergi!',
          '',
          '1–7  pilih bahan  •  klik talenan untuk mencincang ayam & sayur',
          'Klik wajan untuk memasukkan bahan  •  SPASI untuk memasak',
          'Klik piring lalu klik pesanan untuk mengantar  •  ENTER antar otomatis',
          'P  jeda  •  M  suara',
          '',
          `Skor terbaik: ${best} koin`,
        ], 'Tekan ENTER atau klik untuk mulai memasak', PALETTE.gold);
      } else if (screen === SCREEN_PAUSED) {
        overlay('JEDA', ['Istirahat sebentar — wajan menunggu.', '', `Skor sementara: ${state.score} koin`], 'Tekan P untuk lanjut', PALETTE.text);
      } else if (screen === SCREEN_OVER) {
        overlay('SHIFT SELESAI', [
          state.overReason,
          '',
          `Koin: ${state.coins}  •  Pesanan tersaji: ${state.served}  •  Pelanggan pergi: ${state.missed}`,
          `Kombo terbaik: x${state.bestCombo}`,
          `Skor terbaik: ${best} koin`,
        ], 'Tekan R untuk main lagi', PALETTE.gold);
      }
    },
  };
}

// Dapur Kilat's rules: tickets arrive on the order board, the cook picks
// ingredients from the counter, chops what needs chopping, fills the wok,
// cooks, plates and serves before patience runs out.
//
// Every action is a method the mouse, the keyboard and the screenshot
// autopilot all call, so a staged screenshot plays the real rules.
import {
  CHOPS_NEEDED,
  COOK_SECONDS,
  HEARTS,
  INGREDIENT_BY_ID,
  LEVEL,
  MAX_TICKETS,
  MAX_TIP,
  PATIENCE,
  PLATES,
  RECIPES,
  SHIFT_SECONDS,
  STEP,
} from './config.js';

export const EVENT_SERVED = 1;
export const EVENT_EXPIRED = 2;
export const EVENT_OVER = 4;
export const EVENT_COOKED = 8;

let nextTicketId = 1;

/** The three ingredients in the wok, as a set key, match a recipe when they are one. */
export function recipeFor(items) {
  if (items.length !== 3) return null;
  const set = new Set(items);
  return RECIPES.find((r) => r.needs.every((id) => set.has(id))) ?? null;
}

export function createWorld(random) {
  const world = {
    state: null,
    random,
    reset() {
      nextTicketId = 1;
      world.state = {
        time: 0,
        shiftLeft: SHIFT_SECONDS,
        score: 0,
        coins: 0,
        hearts: HEARTS,
        combo: 0,
        bestCombo: 0,
        level: 1,
        tickets: [],
        spawnIn: 2,
        wok: { items: [], cooking: false, progress: 0, dish: null },
        plates: Array.from({ length: PLATES }, () => null),
        hand: null,
        chopProgress: 0,
        served: 0,
        missed: 0,
        cooked: 0,
        over: false,
        overReason: '',
        flash: '',
        flashAt: 0,
      };
      world.spawnTicket();
      world.spawnTicket();
    },
    spawnTicket() {
      const s = world.state;
      if (s.tickets.length >= MAX_TICKETS || s.over) return;
      const dish = random.pick(RECIPES);
      s.tickets.push({
        id: nextTicketId,
        name: dish.name,
        dish: dish.id,
        price: dish.price,
        needs: [...dish.needs],
        patience: PATIENCE,
        maxPatience: PATIENCE,
      });
      nextTicketId += 1;
    },
    /** Pick an ingredient up from the counter (or put the held one back). */
    pickIngredient(id) {
      const s = world.state;
      if (s.over) return false;
      if (s.hand && s.hand.ingredient === id) {
        s.hand = null;
        s.chopProgress = 0;
        return true;
      }
      if (s.hand) return false;
      const ing = INGREDIENT_BY_ID[id];
      if (!ing) return false;
      s.hand = { ingredient: id, chopped: !ing.chop };
      s.chopProgress = 0;
      return true;
    },
    /** One chop on the board; three turn a raw ingredient into a chopped one. */
    chop() {
      const s = world.state;
      if (s.over || !s.hand) return false;
      const ing = INGREDIENT_BY_ID[s.hand.ingredient];
      if (!ing.chop || s.hand.chopped) return false;
      s.chopProgress += 1;
      if (s.chopProgress >= CHOPS_NEEDED) {
        s.hand.chopped = true;
        s.chopProgress = 0;
      }
      return true;
    },
    /** Drop the held ingredient into the wok, when some recipe can use it. */
    addToWok() {
      const s = world.state;
      if (s.over || !s.hand || !s.hand.chopped) return false;
      if (s.wok.items.length >= 3) return false;
      if (s.wok.items.includes(s.hand.ingredient)) return false;
      const usable = RECIPES.some((r) => r.needs.includes(s.hand.ingredient));
      if (!usable) return false;
      s.wok.items.push(s.hand.ingredient);
      s.hand = null;
      s.chopProgress = 0;
      return true;
    },
    /** Start the wok when its three ingredients are one whole recipe. */
    startCooking() {
      const s = world.state;
      if (s.over || s.wok.cooking) return false;
      const recipe = recipeFor(s.wok.items);
      if (!recipe) return false;
      s.wok.cooking = true;
      s.wok.progress = 0;
      s.wok.dish = recipe.id;
      return true;
    },
    /** Empty the wok into the trash (a wrong or abandoned mix). */
    trashWok() {
      const s = world.state;
      if (s.over) return false;
      if (s.wok.items.length === 0 && !s.wok.dish) return false;
      s.wok = { items: [], cooking: false, progress: 0, dish: null };
      return true;
    },
    /** Serve a plated dish to the ticket that ordered it. */
    serve(ticketId) {
      const s = world.state;
      if (s.over) return false;
      const ticket = s.tickets.find((t) => t.id === ticketId);
      if (!ticket) return false;
      const plate = s.plates.findIndex((d) => d === ticket.dish);
      if (plate === -1) return false;
      s.plates[plate] = null;
      s.tickets = s.tickets.filter((t) => t.id !== ticketId);
      const tip = Math.round((MAX_TIP * ticket.patience) / ticket.maxPatience);
      const earned = ticket.price + tip;
      s.coins += earned;
      s.score += earned;
      s.combo += 1;
      s.bestCombo = Math.max(s.bestCombo, s.combo);
      s.served += 1;
      s.flash = `+${earned} koin!`;
      s.flashAt = s.time;
      return true;
    },
    /** Serve the first plated dish that has a waiting ticket. */
    serveAny() {
      const s = world.state;
      for (const ticket of s.tickets) {
        if (s.plates.includes(ticket.dish)) return world.serve(ticket.id);
      }
      return false;
    },
    step(dt) {
      const s = world.state;
      if (s.over) return 0;
      let events = 0;
      s.time += dt;
      s.shiftLeft -= dt;
      s.level = Math.min(LEVEL.max, 1 + Math.floor(s.time / LEVEL.seconds));
      // A new ticket every few seconds, faster as the shift heats up.
      s.spawnIn -= dt;
      if (s.spawnIn <= 0) {
        world.spawnTicket();
        s.spawnIn = Math.max(3.5, 9 - s.level * 1.2);
      }
      for (const ticket of s.tickets) ticket.patience -= dt;
      const expired = s.tickets.filter((t) => t.patience <= 0);
      if (expired.length > 0) {
        s.tickets = s.tickets.filter((t) => t.patience > 0);
        s.hearts -= expired.length;
        s.missed += expired.length;
        s.combo = 0;
        s.flash = expired.length > 1 ? `${expired.length} pelanggan pergi!` : 'Pelanggan pergi!';
        s.flashAt = s.time;
        events |= EVENT_EXPIRED;
      }
      if (s.wok.cooking) {
        s.wok.progress += dt / COOK_SECONDS;
        if (s.wok.progress >= 1) {
          s.wok.progress = 1;
          s.wok.cooking = false;
          s.cooked += 1;
          events |= EVENT_COOKED;
        }
      }
      // A finished dish goes straight to a free plate.
      if (s.wok.dish && s.wok.progress >= 1) {
        const free = s.plates.findIndex((d) => d === null);
        if (free !== -1) {
          s.plates[free] = s.wok.dish;
          s.wok = { items: [], cooking: false, progress: 0, dish: null };
        }
      }
      if (s.hearts <= 0) {
        s.hearts = 0;
        s.over = true;
        s.overReason = 'Semua pelanggan pergi — dapur tutup lebih awal.';
        events |= EVENT_OVER;
      } else if (s.shiftLeft <= 0) {
        s.shiftLeft = 0;
        s.over = true;
        s.overReason = 'Shift selesai! Dapur tutup.';
        events |= EVENT_OVER;
      }
      return events;
    },
  };
  world.reset();
  return world;
}

/** Fixed-step helper: advance the world by whole steps, one action each step. */
export function advance(world, seconds, act) {
  const steps = Math.round(seconds / STEP);
  for (let i = 0; i < steps; i += 1) {
    if (act) act(world, i);
    if (world.step(STEP) & EVENT_OVER) break;
  }
}

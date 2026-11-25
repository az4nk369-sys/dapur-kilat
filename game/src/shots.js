// The screenshot scenes behind ?shot=start|play|end. Each one plays the real
// rules forward from a fresh world for a fixed number of steps, steered by a
// simple autopilot (serve what is plated, cook what is full, fetch the oldest
// ticket's next missing ingredient), so the frame is what a short game really
// looks like and the same seed always gives the same frame.
import { STEP } from './config.js';
import { advance } from './world.js';
import { SCREEN_OVER, SCREEN_PLAY, SCREEN_TITLE } from './render.js';

const START_SECONDS = 5;
const PLAY_SECONDS = 20;
const END_PLAY_SECONDS = 30;

/** One autopilot decision: the next real action toward the oldest ticket. */
function autopilot(world) {
  const s = world.state;
  // Serve anything plated that a ticket wants.
  for (const ticket of s.tickets) {
    if (s.plates.includes(ticket.dish)) {
      world.serve(ticket.id);
      return;
    }
  }
  if (s.wok.cooking) return;
  if (s.wok.items.length === 3) {
    world.startCooking();
    return;
  }
  const ticket = s.tickets[0];
  if (!ticket) return;
  const missing = ticket.needs.find((id) => !s.wok.items.includes(id));
  if (!missing) return;
  if (s.hand) {
    if (s.hand.ingredient === missing) {
      if (s.hand.chopped) world.addToWok();
      else world.chop();
      return;
    }
    // Put the wrong thing back, then fetch the right one next step.
    world.pickIngredient(s.hand.ingredient);
    return;
  }
  world.pickIngredient(missing);
}

/** After the autopilot, make sure the frame shows a dish mid-assembly. */
function ensureMidAssembly(world) {
  const s = world.state;
  if (s.wok.items.length > 0 || s.wok.cooking) return;
  const ticket = s.tickets[0];
  if (!ticket) return;
  let added = 0;
  for (const id of ticket.needs) {
    if (added >= 2) break;
    if (s.wok.items.includes(id)) continue;
    // Fetch it (chopping as needed) and drop it in the wok, for real.
    let guard = 0;
    while (guard < 600) {
      guard += 1;
      if (!s.hand) {
        world.pickIngredient(id);
      } else if (s.hand.ingredient !== id) {
        world.pickIngredient(s.hand.ingredient);
      } else if (!s.hand.chopped) {
        world.chop();
      } else if (world.addToWok()) {
        added += 1;
        break;
      } else {
        break;
      }
      world.step(STEP);
    }
  }
}

/**
 * Set `world` to the named scene (start, play or end; any other name is start)
 * and return the screen to draw over it and the best score to show.
 */
export function stageShot(name, world) {
  world.reset();
  if (name !== 'play' && name !== 'end') {
    advance(world, START_SECONDS, null);
    return { screen: SCREEN_TITLE, best: 0 };
  }
  if (name === 'play') {
    // Play until a plate holds a dish and the wok is mid-assembly (or time out).
    const steps = Math.round(45 / STEP);
    for (let i = 0; i < steps; i += 1) {
      autopilot(world);
      if (world.step(STEP) & 4) break; // EVENT_OVER
      const s = world.state;
      if (s.plates.some((d) => d !== null) && s.wok.items.length >= 1) break;
      if (s.time >= PLAY_SECONDS && s.plates.some((d) => d !== null)) break;
    }
    ensureMidAssembly(world);
    return { screen: SCREEN_PLAY, best: world.state.score };
  }
  // End: play well for a while, then stop cooking and let the shift run out.
  advance(world, END_PLAY_SECONDS, (w) => autopilot(w));
  advance(world, 300, null);
  return { screen: SCREEN_OVER, best: world.state.score };
}

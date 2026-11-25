// Keyboard and mouse for Dapur Kilat. Clicks are hit-tested against the
// renderer's zones; keys are the counter shortcuts plus the action keys.
import { INGREDIENTS } from './config.js';
import { zones } from './render.js';

export const ACTION_CONFIRM = 'confirm';
export const ACTION_PAUSE = 'pause';
export const ACTION_RESTART = 'restart';
export const ACTION_MUTE = 'mute';

function inside(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

export function createInput(canvas, world, hooks) {
  const z = zones();
  let mouse = { x: 640, y: 360 };
  let selectedPlate = -1;

  function toLogical(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * 1280,
      y: ((event.clientY - rect.top) / rect.height) * 720,
    };
  }

  function clickAt(p) {
    const s = world.state;
    if (hooks.screen() !== 'play') {
      hooks.confirm();
      return;
    }
    // A ticket: serve the plated dish it ordered.
    for (let i = 0; i < z.tickets.length; i += 1) {
      if (inside(p.x, p.y, z.tickets[i])) {
        const ticket = s.tickets[i];
        if (ticket) world.serve(ticket.id);
        return;
      }
    }
    // A plate: remember it, then a ticket click serves it (serve() picks any plate).
    for (let i = 0; i < z.plates.length; i += 1) {
      if (inside(p.x, p.y, z.plates[i])) {
        selectedPlate = i;
        return;
      }
    }
    for (const bin of z.bins) {
      if (inside(p.x, p.y, bin)) {
        world.pickIngredient(bin.id);
        hooks.click();
        return;
      }
    }
    if (inside(p.x, p.y, z.board)) {
      if (world.chop()) hooks.chop();
      return;
    }
    if (inside(p.x, p.y, z.wok)) {
      if (s.wok.items.length === 3) {
        if (world.startCooking()) hooks.cook();
      } else if (world.addToWok()) {
        hooks.click();
      }
      return;
    }
    if (inside(p.x, p.y, z.trash)) {
      if (s.hand) {
        world.pickIngredient(s.hand.ingredient);
      } else {
        world.trashWok();
      }
    }
  }

  function keyDown(event) {
    const s = world.state;
    if (event.repeat) return;
    const key = event.key.toLowerCase();
    if (key === 'm') {
      hooks.mute();
      return;
    }
    if (hooks.screen() === 'play' && key === 'p') {
      hooks.pause();
      return;
    }
    if (hooks.screen() !== 'play') {
      if (key === 'enter' || key === ' ') hooks.confirm();
      if (key === 'r' && hooks.screen() === 'over') hooks.restart();
      return;
    }
    const ing = INGREDIENTS.find((i) => i.key === key);
    if (ing) {
      world.pickIngredient(ing.id);
      hooks.click();
      return;
    }
    if (key === 'c') {
      if (world.chop()) hooks.chop();
    } else if (key === ' ') {
      event.preventDefault();
      if (world.startCooking()) hooks.cook();
      else world.addToWok();
    } else if (key === 'enter') {
      if (world.serveAny()) hooks.serve();
    }
  }

  canvas.addEventListener('pointermove', (event) => {
    mouse = toLogical(event);
  });
  canvas.addEventListener('pointerdown', (event) => {
    mouse = toLogical(event);
    clickAt(mouse);
  });
  window.addEventListener('keydown', keyDown);

  return {
    mouse() {
      return mouse;
    },
  };
}

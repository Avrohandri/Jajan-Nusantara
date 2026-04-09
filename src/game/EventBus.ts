// EventBus — Simple event emitter for React ↔ Phaser communication
type EventCallback = (...args: unknown[]) => void;

const listeners: Record<string, EventCallback[]> = {};

export const EventBus = {
  on(event: string, callback: EventCallback) {
    if (!listeners[event]) listeners[event] = [];
    listeners[event].push(callback);
  },

  off(event: string, callback: EventCallback) {
    if (!listeners[event]) return;
    listeners[event] = listeners[event].filter(cb => cb !== callback);
  },

  emit(event: string, ...args: unknown[]) {
    if (!listeners[event]) return;
    listeners[event].forEach(cb => cb(...args));
  },

  removeAll() {
    Object.keys(listeners).forEach(key => delete listeners[key]);
  },
};

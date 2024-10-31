// store/eventBus.ts

import { defineStore } from 'pinia';

export const eventBus = defineStore({
  id: 'eventBus',
  state: () => ({
    events: {} as Record<string, Function[]>
  }),
  actions: {
    on(eventName: string, callback: Function) {
      if (!this.events[eventName]) {
        this.events[eventName] = [];
      }
      this.events[eventName].push(callback);
    },
    emit(eventName: string, ...args: any[]) {
      if (this.events[eventName]) {
        this.events[eventName].forEach(callback => {
          callback(...args);
        });
      }
    },
    off(eventName: string, callback: Function) {
      if (this.events[eventName]) {
        this.events[eventName] = this.events[eventName].filter(cb => cb !== callback);
      }
    },
    off_all(eventName: string) {
      if (this.events[eventName]) {
        delete this.events[eventName]
      }
    }
  }
});

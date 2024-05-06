import { create } from 'zustand';

import { PersistedStore, createPersistedStore } from './persisted';
import { ProtectedStore, createProtectedStore } from './protected';
import { SessionStore, createSessionStore } from './session';

export const usePersistedStore = create<PersistedStore>()(createPersistedStore);
export const useProtectedStore = create<ProtectedStore>()(createProtectedStore);
export const useSessionStore = create<SessionStore>()(createSessionStore);

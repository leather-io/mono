import { StateCreator } from 'zustand';

interface SessionState {}

interface SessionAction {}

export type SessionStore = SessionState & SessionAction;
// Placeholder for client-side non-persistent data.
export const createSessionStore: StateCreator<SessionStore> = () => ({});

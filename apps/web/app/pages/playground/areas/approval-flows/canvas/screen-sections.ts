import type { Scenario } from '../scenarios/scenario';

export interface CanvasScreenSection {
  id: string;
  label: string;
  scenarios: Scenario[];
}

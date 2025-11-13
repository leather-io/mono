import mixpanel from 'mixpanel-browser';

export function setupMixpanelMock() {
  vi.mock(import('mixpanel-browser'), () => {
    return {
      default: {
        track: vi.fn(),
        identify: vi.fn(),
        setGroup: vi.fn(),
        getGroup: vi.fn(() => ({
          set: vi.fn(),
        })),
        getPeople: vi.fn(() => ({
          set: vi.fn(),
        })),
      },
    } as Partial<typeof mixpanel>;
  });
}

export function setupMixpanelMock() {
  vi.mock('mixpanel-browser', () => {
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
    };
  });
}

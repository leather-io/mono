const resp = {
  success: true,
};

export const leatherZealyQuestConnectEarnHandler = {
  path: 'https://*.leather.io/v1/quests/connect-earn/complete',
  resp,
  method: 'post',
} as const;

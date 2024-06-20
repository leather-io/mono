import { useMutation } from '@tanstack/react-query';

export function useSubmitWaitingListEmailForm() {
  return useMutation({
    mutationKey: ['formSubmission'],
    mutationFn: async (email: string) => {
      const response = await fetch(
        'https://api.hsforms.com/submissions/v3/integration/submit/43669123/0ece8e2b-efb8-4df8-9ee0-475fa9e157ec',
        {
          method: 'POST',
          headers: new Headers({ 'content-type': 'application/json' }),
          body: JSON.stringify({
            fields: [{ name: 'email', value: email }],
          }),
        }
      );
      if (!response.ok) throw new Error('Email submission failed');
      return response.json();
    },
  });
}

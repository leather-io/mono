export interface RecipientSuggestion {
  type: 'internal' | 'external';
  id: string;
  title: string;
  subtitle: string;
}

export interface RecipientSuggestionSection {
  title: string;
  data: RecipientSuggestion[];
}

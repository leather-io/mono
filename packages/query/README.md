# @leather.io/queries

We use `React Query` to fetch APIs and to manage the cache of the responses.

Code practices:

1. Queries must only export **query builders**. Do not export React hooks
2. API calls must be kept separate

```jsx
function fetchGroups(): Promise<Group[]> {
  return axios.get('groups').then((response) => response.data)
}

// ✅ Export query builder
export function createGroupsQuery() {
  return { queryKey: ['groups'], queryFn: fetchGroups };
}

// ❌ Do not export a pre-made query
export function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
}
```

Reference

- https://tkdodo.eu/blog/practical-react-query
- https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories

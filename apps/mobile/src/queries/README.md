# App API cache (server-side state)

We use `React Query` to fetch APIs and to manage the cache of the responses.

Code practices:

1. Create custom hooks for queries, don't use plain `useQuery` in components.
2. Treat the query key like a dependency array. queryFn should receive same arguments as a queryKey.
3. Use selectors to transform the data before usage. Example:

```jsx
export function useTodosQuery(select) {
  return useQuery({
    queryKey: ['todos'],
    queryFn: fetchTodos,
    select,
  });
}

export function useTodosCount() {
  return useTodosQuery(data => data.length);
}
export function useTodo(id) {
  return useTodosQuery(data => data.find(todo => todo.id === id));
}
```

4. Keep api layer separate from the queries (queryFn separate from useQueries). Example:

```jsx
function fetchGroups(): Promise<Group[]> {
  return axios.get('groups').then((response) => response.data)
}

// ✅ data will be `Group[] | undefined` here
function useGroups() {
  return useQuery({ queryKey: ['groups'], queryFn: fetchGroups })
}

// ✅ data will be `number | undefined` here
function useGroupCount() {
  return useQuery({
    queryKey: ['groups'],
    queryFn: fetchGroups,
    select: (groups) => groups.length,
  })
}
```

5. Structure your Query Keys from most generic to most specific. Example:

```jsx
['todos', 'list', { filters: 'all' }][('todos', 'list', { filters: 'done' })][
  ('todos', 'detail', 1)
][('todos', 'detail', 2)];
```

6. Optional: we might want to try the concept of query key factory: https://tkdodo.eu/blog/effective-react-query-keys#use-query-key-factories

Reference: https://tkdodo.eu/blog/practical-react-query

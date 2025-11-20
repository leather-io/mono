# Features

This package contains shared utilities for Leather Wallet's features for our web + React Native applications.

## Usage Rules

- **No platform-specific knowledge:** Components and hooks in this package do not contain any logic or imports that are specific to React Native or web platforms. All code is strictly platform-agnostic.

- **Uses only React primitives:** Functionality is built using core React primitives such as hooks (`useState`, `useEffect`, etc.) and contexts (`React.createContext`, `useContext`), ensuring compatibility and reusability.

- **Headless components:** There are no presentational components or JSX outputs. All business logic and state management are handled in headless hooks and context providers. You bring your own UI.

- **Render pattern:** All state and actions are exposed via render prop or hook return signatures. The consumer is responsible for supplying rendering logic and defining UI.

### Example

```js
// Usage of a headless feature hook
const { value, setValue } = useSomeFeature();

return (
  <CustomUIComponent value={value} onChange={setValue} />
);
```

Or with a render prop:

```js
<SomeFeatureProvider>
  {({ value, setValue }) => <CustomUI value={value} onChange={setValue} />}
</SomeFeatureProvider>
```

**Note:** No JSX or UI is shipped—every API is logic-only and fully controlled by consumers.

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---

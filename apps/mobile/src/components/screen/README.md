# Screen

`Screen` defines the top-level layout for every screen in the app. 
It handles safe area insets, Action Bar offsetting, scroll behavior, and optional animated headers.

### Basic non-scrolling example

```tsx
<Screen>
  <Screen.Header />
  <Screen.Body>
    ...content
  </Screen.Body>
</Screen>
```

### Scrollview

```tsx
<Screen>
  <Screen.Header />
  <Screen.ScrollView>
    ...content
  </Screen.ScrollView>
</Screen>
```

### List

```tsx
<Screen>
  <Screen.Header />
  <Screen.List     
    data={data}
    renderItem={renderItem}
  >
    ...content
  </Screen.List>
</Screen>
```

Screen.List is a thin wrapper around [FlatList](https://reactnative.dev/docs/flatlist) and supports the same props.

### Animated titles

The following combination is set to automatically fade in `centerElement` when `Screen.
Title` leaves the viewport:


```tsx
<Screen>
  <Screen.Header centerElement={<HeaderTitle title="Title" />} />
  <Screen.ScrollView>
    <Screen.Title>Large Title</Screen.Title>
    ...content
  </Screen.ScrollView>
</Screen>
```

### Custom animation targets

Use `Screen.HeaderAnimationTarget` to trigger header animations from any element:

```tsx
<Screen>
  <Screen.Header centerElement={<HeaderTitle title="Title" />} />
  <Screen.ScrollView>
    <Screen.HeaderAnimationTarget>Custom screen title</Screen.HeaderAnimationTarget>
    ...content
  </Screen.ScrollView>
</Screen>
```

### Scroll tracking

`Screen` has built-in scroll tracking that can be used for implementing scroll-aware 
animations/behavior in nested components

```tsx
<Screen>
  <Screen.Header />
  <Screen.ScrollView>
    <CustomComponent />
  </Screen.ScrollView>
</Screen>
```


```tsx
// custom-component.tsx
function CustomComponent() {
  const { scrollY } = useScreenScrollContext()
  const fadeInThreshold = 24;
  
  const animatedStyle = useAnimatedStyle(() => {
    opacity: withSpring(scrollY.value > fadeInThreshold ? 1 : 0)
  }) 
}
```

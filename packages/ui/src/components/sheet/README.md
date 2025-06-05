# Sheet

`Sheet` provides modal bottom sheets and permanent bottom sheets for React Native.
We use `Sheet` for `BottomSheetModal` as this is our primary pattern, and `PermanentSheet` for `BottomSheet`.
Familiarity with [React Native Bottom Sheet](https://gorhom.dev/react-native-bottom-sheet/) is recommended.

All sheets require either `Sheet.View` or a scrollable container (`Sheet.ScrollView`, `Sheet.FlashList`, etc.) as the immediate child to handle safe area insets and rounded corners properly.

### Basic modal sheet

```tsx
const sheetRef = useRef<SheetInstance>(null);

<Sheet ref={sheetRef}>
  <Sheet.View>
    <Sheet.Header leftElement={<Sheet.Title>Title</Sheet.Title>} />
    ...content
  </Sheet.View>
</Sheet>;
```

### Scrolling content

```tsx
<Sheet ref={sheetRef}>
  <Sheet.ScrollView>
    <Sheet.Header leftElement={<Sheet.Title>Title</Sheet.Title>} />
    ...content
  </Sheet.ScrollView>
</Sheet>
```

### Sticky Header

```tsx
<Sheet ref={sheetRef}>
  <Sheet.ScrollView stickyHeaderIndices={[0]}>
    <Sheet.Header leftElement={<Sheet.Title>Title</Sheet.Title>} />
    ...content
  </Sheet.ScrollView>
</Sheet>
```

### List content

For virtualized lists, use the appropriate container:

```tsx
<Sheet ref={sheetRef}>
  <Sheet.FlashList
    data={data}
    renderItem={renderItem}
    ListHeaderComponent={<Sheet.Header leftElement={<Sheet.Title>Title</Sheet.Title>} />}
  />
</Sheet>
```

### Header configuration

`Sheet.Header` accepts three positioning elements:

```tsx
<Sheet.Header
  leftElement={<Sheet.Title>Title</Sheet.Title>}
  centerElement={<Badge>Status</Badge>}
  rightElement={<CloseButton onPress={() => sheetRef.current?.dismiss()} />}
  bottomElement={<Divider />}
/>
```

### Handle placement

Control the drag handle position:

```tsx
// Handle above sheet content (default)
<Sheet ref={sheetRef} handlePlacement="outside">

// Handle inside sheet content
<Sheet ref={sheetRef} handlePlacement="inside">
```

### Dynamic height

Sheets automatically size to content. Constrain maximum height when needed:

```tsx
const { top } = useSafeAreaInsets();
const maxHeight = Dimensions.get('screen').height - top - HEADER_HEIGHT;

<Sheet ref={sheetRef} maxDynamicContentSize={maxHeight}>
```

### Permanent sheets

For non-dismissible bottom sheets anchored to screen bottom:

```tsx
const sheetRef = useRef<PermanentSheetInstance>(null);

<PermanentSheet ref={sheetRef} snapPoints={['25%', '50%']}>
  <Sheet.View>...content</Sheet.View>
</PermanentSheet>;
```

### Text input

Use `Sheet.TextInput` for keyboard-aware text inputs within sheets:

```tsx
<Sheet ref={sheetRef}>
  <Sheet.View>
    <Sheet.TextInput placeholder="Enter text" value={value} onChangeText={setValue} />
  </Sheet.View>
</Sheet>
```

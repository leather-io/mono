# App state (client-side state)

We keep the app state using `zustand`.

We have 3 types of store:

1. Persisted data - kept using expo-secure-storage, but without requiring authentication. Used for stuff like xpubs or for persisted settings like user preferred color scheme.
2. Protected data - kept using expo-secure-storage, but with FaceID authentication. Usually used for mnemonics.
3. Temporary data - client-side data that is not persisted between sessions.

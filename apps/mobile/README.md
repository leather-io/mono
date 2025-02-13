# Leather Mobile Wallet

Leather is the most popular and trusted wallet for apps built on Bitcoin. And now it's coming to iOS and Android!

## Development

This app is an [Expo](https://expo.dev/) mobile application. So there are a few prerequisites to have installed on your computer before we can proceed.

### Prerequisites

- [Node and Pnpm](https://nodejs.org/en/download)
- [Watchman](https://facebook.github.io/watchman/docs/install#buildinstall) for MacOS and Linux users.
- `pnpm i` in the monorepo root folder.

If you want to run this in an iOS simulator:

- MacOS computer
- [XCode](https://apps.apple.com/am/app/xcode/id497799835)
- [Install CocoaPods](https://guides.cocoapods.org/using/getting-started.html)

And for Android emulator:

- [Android studio](https://developer.android.com/studio)
- [Install Android emulator with Android studio](https://developer.android.com/studio/run/emulator#avd)

Running on iOS device:

- Install [Expo app from AppStore](https://apps.apple.com/am/app/expo-go/id982107779) on your device.
- Scan the QR code that is going to be shown in the terminal after running the expo server in the next section

Running on Android device

- Install [Expo app from Google Play](https://play.google.com/store/apps/details?id=host.exp.exponent&pli=1) on your device.
- Scan the QR code that is going to be shown in the terminal after running the expo server in the next section

#### Credentials

1. When running `pnpm run ios` or `pnpm run android`, you are going to be prompted for the firebase login.
   That is essential for building the app and it is needed for firebase push notifications
2. You would also need to have .env setup.
   You can either do it yourself using .env.example file or you can use 1password cli to download it from the vault.
   To do that you would need to run `pnpm run 1password:env:dev` to install the .env file.

To make sure you have 1password cli installed and signed in on your machine, follow these instructions: https://developer.1password.com/docs/cli/get-started

### Running the application

- `pnpm run start` if you want to test the app on your personal Android or iOS device

- `pnpm run ios` if you want to run it on iOS simulator

- `pnpm run android` if you want to run it on Android emulator

If you encounter difficulties with `pnpm run ios` you can instead run:

- `pnpm start`

- Once started press `i` to open it in the ios simulator

## License

[MIT](../../LICENSE) © [Leather Wallet LLC](https://github.com/leather-io/mono)

---

[⬅ Back](../../README.md)

---

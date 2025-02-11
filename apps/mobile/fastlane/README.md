fastlane documentation
----

# Installation

Make sure you have the latest version of the Xcode command line tools installed:

```sh
xcode-select --install
```

For _fastlane_ installation instructions, see [Installing _fastlane_](https://docs.fastlane.tools/#installing-fastlane)

# Available Actions

### notify_slack

```sh
[bundle exec] fastlane notify_slack
```



----


## iOS

### ios build_ios

```sh
[bundle exec] fastlane ios build_ios
```

Build and distribute iOS app

### ios increment_version

```sh
[bundle exec] fastlane ios increment_version
```



### ios notify_slack

```sh
[bundle exec] fastlane ios notify_slack
```



### ios distribute_ios

```sh
[bundle exec] fastlane ios distribute_ios
```



----


## Android

### android build_android

```sh
[bundle exec] fastlane android build_android
```

Build and distribute Android app

### android notify_slack

```sh
[bundle exec] fastlane android notify_slack
```



### android test_notify_slack

```sh
[bundle exec] fastlane android test_notify_slack
```



### android distribute_android_beta

```sh
[bundle exec] fastlane android distribute_android_beta
```



### android distribute_android_prod

```sh
[bundle exec] fastlane android distribute_android_prod
```



----

This README.md is auto-generated and will be re-generated every time [_fastlane_](https://fastlane.tools) is run.

More information about _fastlane_ can be found on [fastlane.tools](https://fastlane.tools).

The documentation of _fastlane_ can be found on [docs.fastlane.tools](https://docs.fastlane.tools).

# Mobile App E2E tests with Maestro

## To get started

1. Install Maestro on your laptop, my preferred way for that would be using brew: <https://maestro.mobile.dev/getting-started/installing-maestro>
2. Build your app as always, using `pnpm ios`
3. Run `maestro test maestro/flows/create-wallet.yaml` or any other flow from `maestro/flows` folder.

### The structure of maestro folder

It contains 2 folders, one called `shared`, and the other one `flows`
`flows` folder is the actual end-2-end test, while `shared` is for steps that are shared between flows

### How to write tests

Writing tests is fairly simple. Here’s the step-by-step on how to do that:

1. Create a yaml file in `maestro/flows`
2. Set appId on top, and start the flow with `launchApp`

   ``` appId: io.leather.mobilewallet
   ---
   - launchApp
   ```

3. Run some shared flows to get the app to the clean state, stuff like `runFlow: ../shared/clean-up.yaml` for cleaning up state and `runFlow: ../shared/add-wallet.yaml` to set wallet in your flow

4. Add `tapOn` step s.t. maestro taps on a specified button or input. For `tapOn` to work, we need to set `testID`-s on React Native components. Only components exported from React Native (and libraries that forward testID from their component to a React Native component) support testID. So, whenever we create a custom component that needs to handle a testID (e.g. Cell) we need to make sure that it can correctly forward testID to the underlying React Native component.
5. Add `assertVisible` to make sure something is visible or `assertNotVisible` to make sure otherwise.
6. Basically that’s it, now we can get into writing some tests.

To help you out with building the flow, you can also use `maestro studio`. You can manually select on iphone’s screen where test should click and maestro would create a flow for you that you can later export.

Maestro is built with async in mind, so whenever we do any of the actions, maestro waits for some reasonable time. That way we don’t really need to use any `sleep` functions.

To run all of the flows locally, you can run `maestro test maestro/flows`.

Whenever you create a new flow don't forget to add it in expo build [maestro-flows.yaml](../apps/mobile/.eas/functions/maestro-flows.yaml):

You want a recording of your new changes? Simply create an E2E test for you changes and run `maestro record maestro/flows/your-amazing-flow.yaml` and it will create an mp4 for you!

### Add test to CI

To add test to CI, you need to add it to the `run_maestro_tests` function in [maestro.yml](../apps/mobile/.eas/common/maestro.yml)

Refs:

1. [Maestro API Reference](https://maestro.mobile.dev/api-reference/commands)

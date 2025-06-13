# React Native Harmony Gesture Handler

## Running the `tester` app

### Installing unreleased RNOH

If RNOH@0.77 was released, update package.json and remove this instruction. Otherwise:

1. Go to RNOH repo and follow setup instructions for RNOH Maintainers
1. Create `react-native-oh-react-native-harmony-0.77.X.tgz` (probably `pnpm pack` in `<RNOH_REPO>/packages/react-native-harmony`)
1. Create `react-native-oh-react-native-harmony-cli-0.77.X.tgz` (probably `pnpm pack` in `<RNOH_REPO>/packages/react-native-harmony-cli`)
1. Copy and paste those artifacts to `./packages`
1. Update paths to those artifacts in `react-native-harmony-gesture-handler/package.json` and in `tester/package.json`

### Installing dependencies and preparing development environment

1. Go to `/tester`
1. Run `npm run i`
1. Open `tester/harmony` in DevEco Studio

### Generate signing config

1. Open `File -> Project Structure -> Signing Configs`
2. Log in to your Huawei developer account and proceed with provided instructions

### Running the app

1. Go to `/tester`
2. Run `npm run start`
3. Open `tester/harmony` in DevEco Studio
4. Build and run `entry` module

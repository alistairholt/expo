import { ConfigPlugin, WarningAggregator, withAppDelegate } from '@expo/config-plugins';

const DEV_MENU_IOS_IMPORT = `
#if defined(EX_DEV_MENU_ENABLED)
@import EXDevMenu;
#endif`;

const DEV_MENU_IOS_INIT = `
#if defined(EX_DEV_MENU_ENABLED)
  [DevMenuManager configureWithBridge:bridge];
#endif`;

export function modifyAppDelegate(appDelegate: string) {
  if (!appDelegate.includes(DEV_MENU_IOS_IMPORT)) {
    const lines = appDelegate.split('\n');
    lines.splice(1, 0, DEV_MENU_IOS_IMPORT);

    appDelegate = lines.join('\n');
  }

  if (!appDelegate.includes(DEV_MENU_IOS_INIT)) {
    const lines = appDelegate.split('\n');

    const initializeReactNativeAppIndex = lines.findIndex(line =>
      line.includes('- (RCTBridge *)initializeReactNativeApp')
    );

    const rootViewControllerIndex = lines.findIndex(
      (line, index) => initializeReactNativeAppIndex < index && line.includes('rootViewController')
    );

    lines.splice(rootViewControllerIndex - 1, 0, DEV_MENU_IOS_INIT);

    appDelegate = lines.join('\n');
  }
  return appDelegate;
}

export const withDevMenuAppDelegate: ConfigPlugin = config => {
  return withAppDelegate(config, config => {
    if (config.modResults.language === 'objc') {
      config.modResults.contents = modifyAppDelegate(config.modResults.contents);
    } else {
      WarningAggregator.addWarningIOS(
        'expo-dev-menu',
        'Swift AppDelegate files are not supported yet.'
      );
    }
    return config;
  });
};

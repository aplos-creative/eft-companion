define([
  '../../scripts/constants/window-names.js',
  '../../scripts/services/running-game-service.js',
  '../../scripts/services/windows-service.js',
  '../../scripts/services/hotkeys-service.js',
  '../../scripts/services/gep-service.js',
  '../../scripts/services/event-bus.js'
], function (WindowNames,
             runningGameService,
             WindowsService,
             hotkeysService,
             gepService,
             eventBus) {

  class BackgroundController {
    static async run() {
      // this will be available when calling overwolf.windows.getMainWindow()
      window.ow_eventBus = eventBus;
      window.minimize = BackgroundController.minimize;

      // Handle what happens when the app is launched while already running
      // (relaunch)
      BackgroundController._registerAppLaunchTriggerHandler();
      // Register handlers to hotkey events
      BackgroundController._registerHotkeys();

      let isGameRunning = await runningGameService.isGameRunning();

      // Obtain windows and set their sizes:
      // Desktop:
      const desktopWindowName = await WindowsService.getStartupWindowName();
      const desktopWindow = await WindowsService.obtainWindow(desktopWindowName);
      await WindowsService.changeSize(desktopWindow.window.id, 1200, 659);
      await WindowsService.changePositionCenter(desktopWindowName);
      // In-Game:
      const inGameWindow = await WindowsService.obtainWindow(WindowNames.IN_GAME);
      await WindowsService.changeSize(inGameWindow.window.id, 1641, 692);

      const desktopMessage = `Note that app is targeted to Fortnite.
        An app can declare itself as targeted to one or more games.`;
      const ingameMessage = `Once you get into a match, you'll start seeing
        events and info updates in the in-game window.`;

      // Determine which window (desktop/in-game) to display when app is launched
      if (!isGameRunning) {
        // Game isn't runnig, display desktop window
        WindowsService.restore(desktopWindowName);
        BackgroundController._displayNotification('Notification', desktopMessage, 10);
      }
      else {
        // Register to game events
        gepService.registerToGEP(BackgroundController.onGameEvents, BackgroundController.onInfoUpdate);
        // Display in-game window
        await WindowsService.restore(WindowNames.IN_GAME);
        WindowsService.minimize(WindowNames.IN_GAME);
        BackgroundController._displayNotification('Events', ingameMessage, 10);
      }

      // Switch between desktop/in-game windows when launching/closing game
      runningGameService.addGameRunningChangedListener(async (isGameRunning) => {
        if (isGameRunning) {
          // Register to game events
          gepService.registerToGEP(BackgroundController.onGameEvents, BackgroundController.onInfoUpdate);
          // Open in-game window
          await WindowsService.restore(WindowNames.IN_GAME);
          // Close desktop window
          WindowsService.close(WindowNames.DESKTOP);
          // And display a notification
          BackgroundController._displayNotification('Events', ingameMessage, 10);
        } else {
          // Open desktop window
          await WindowsService.restore(WindowNames.DESKTOP);
          // Close in-game window
          WindowsService.close(WindowNames.IN_GAME);
        }
      });

      // Listen to changes in windows
      overwolf.windows.onStateChanged.addListener(async () => {
        // If there's only 1 window (background) open, close the app
        const openWindows = await WindowsService.getOpenWindows();
        if (Object.keys(openWindows).length <= 1) {
          window.close();
        }
      });
    }

    /**
     * Minimize all app windows
     * @public
     */
    static async minimize() {
      const openWindows = await WindowsService.getOpenWindows();
      for (let windowName in openWindows) {
        await WindowsService.minimize(windowName);
      }
    }

    /**
     * Display notification
     * @private
     */
    static async _displayNotification(title, message, time) {
      const data = { title, message, time };
      const notificationWindow = await WindowsService.obtainWindow(WindowNames.NOTIFICATION);

      await WindowsService.changeSize(WindowNames.NOTIFICATION, 320, 260);
      await WindowsService.changePositionCenter(WindowNames.NOTIFICATION);

      // Display notification
      await WindowsService.restore(WindowNames.NOTIFICATION);
      // Start notification timer
      // We use a timeout to give the notification controller time to register
      // to the event bus.
      setTimeout(() => {
        window.ow_eventBus.trigger('notification', data);
      }, 1000);
    }

    /**
     * handles app launch trigger event - i.e dock icon clicked
     * @private
     */
    static _registerAppLaunchTriggerHandler() {
      overwolf.extensions.onAppLaunchTriggered.removeListener(
        BackgroundController._onAppRelaunch);
      overwolf.extensions.onAppLaunchTriggered.addListener(
        BackgroundController._onAppRelaunch);
    }

    static _onAppRelaunch() {
      WindowsService.restore(WindowNames.DESKTOP);
    }

    /**
     * set custom hotkey behavior
     * @private
     */
    static _registerHotkeys() {
      hotkeysService.setToggleHotkey(async () => {
        let state = await WindowsService.getWindowState(WindowNames.IN_GAME);
        if ((state === 'minimized') || (state === 'closed')) {
          WindowsService.restore(WindowNames.IN_GAME)
        } else if ((state === 'normal') || (state === 'maximized')) {
          WindowsService.minimize(WindowNames.IN_GAME)
        }
      });
    }

    /**
     * Pass events to windows that are listening to them
     * @private
     */
    static onGameEvents(data) {
      for (let event of data.events) {
        console.log(JSON.stringify(event));
        window.ow_eventBus.trigger('event', event);
      }
    }

    /**
     * Pass info updates to windows that are listening to them
     * @private
     */
    static onInfoUpdate(data) {
      window.ow_eventBus.trigger('info', data);
    }
  }


  return BackgroundController;
});

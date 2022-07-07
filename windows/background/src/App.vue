<script setup lang="ts">
import {
  OWGameListener,
  windowNames,
  eftClassId,
  OWGames,
  OWWindow,
} from '@aploscreative/common';
import { onMounted } from 'vue';

let _windows: any = {};
let _gameListener: OWGameListener;

// Created
_gameListener = new OWGameListener({
  onGameStarted: toggleWindows.bind(this),
  onGameEnded: toggleWindows.bind(this),
});
_gameListener.start();
let currentWindow: string | null = null;

onMounted(async () => {
  currentWindow = (await isEftRunning())
    ? windowNames.inGame
    : windowNames.desktop;
  _windows[currentWindow]?.restore();

  _windows = {};
  _windows[windowNames.desktop] = new OWWindow(windowNames.desktop);
  _windows[windowNames.inGame] = new OWWindow(windowNames.inGame);
});

function toggleWindows(info: any) {
  if (!info || !isGameEft(info)) {
    return;
  }
  if (info.isRunning) {
    _windows[windowNames.desktop].close();
    _windows[windowNames.inGame].restore();
  } else {
    _windows[windowNames.inGame].close();
    _windows[windowNames.desktop].restore();
  }
}

async function isEftRunning(): Promise<boolean> {
  const info = await OWGames.getRunningGameInfo();
  return info && info.isRunning && isGameEft(info);
}

function isGameEft(info: any) {
  return info.classId === eftClassId;
}
</script>

<template></template>

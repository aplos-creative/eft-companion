<script setup lang="ts">
import { OWWindow } from '@aploscreative/common';
import { onMounted } from 'vue';

const _backgroundWindow: OWWindow = new OWWindow('background')
const _currentWindow: OWWindow = new OWWindow('desktop');
const _modal: HTMLElement | null = document.getElementById('exitMinimizeModal');
const _closeButton: HTMLElement | null = document.getElementById('closeButton');
const _minimizeHeaderButton: HTMLElement | null = document.getElementById('minimizeButton');
const _exitButton: HTMLElement | null = document.getElementById('exit');
const _minimizeButton: HTMLElement | null = document.getElementById('minimize');
const _header: HTMLElement | null = document.getElementsByClassName("app-header")[0] as HTMLElement;
const _version: HTMLElement | null = document.getElementById("version");

onMounted(() => {})

</script>

<template>
  <div class="eft-desktop--wrapper"></div>
</template>

<style scoped lang="scss">
@import '../../../global.scss';
.eft-desktop--wrapper {
  background-color: $dark;
  height: 100vh;
  width: 100%;
}
</style>

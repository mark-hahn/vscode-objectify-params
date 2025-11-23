<template>
  <div class="section">
    <div class="row gap">
      <label class="chk-label">
        <input type="checkbox" v-model="autoStart" @change="emit('setAutoStart', autoStart)">
        <span>Start Immediately When Target App Starts</span>
        <span class="hint-icon" @click.stop="toggleHint('autoStart')">?</span>
      </label>
    </div>
    <Hint v-if="hint==='autoStart'" text="If enabled capturing starts immediately when debugging starts. If disabled capturing only starts when Start button is pressed" @close="hint=null" />
    
    <div class="row wrap gap">
      <label class="field">
        <span class="lbl">Buffer Length<span class="hint-icon" @click.stop="toggleHint('writeBufLen')">?</span></span>
        <input type="text" v-model="writeBufLenStr" @input="onWriteBufLen" />
      </label>
      <label class="field">
        <span class="lbl">Max Captures<span class="hint-icon" @click.stop="toggleHint('maxCaptures')">?</span></span>
        <input type="text" v-model="maxCapturesStr" @input="onMaxCaptures" />
      </label>
      <label class="field">
        <span class="lbl">Timeout(ms)<span class="hint-icon" @click.stop="toggleHint('timeout')">?</span></span>
        <input type="text" v-model="timeoutStr" @input="onTimeout" />
      </label>
    </div>
    <Hint v-if="hint==='writeBufLen'" text="The number of recent capture values that are stored in a buffer. Each variable has its own buffer of this length. This number does not affect triggering" @close="hint=null" />
    <Hint v-if="hint==='maxCaptures'" text="Stop capturing when the total number of probe value captures of all variables reaches this limit. Enter zero for no limit" @close="hint=null" />
    <Hint v-if="hint==='timeout'" text="Stop capturing after this many milliseconds. Enter zero for no timeout" @close="hint=null" />
  </div>
</template>

<script lang="ts" setup>

import { ref, toRefs, watch }    from 'vue'
import Hint       from './hint.vue'
import { msgBus } from './messagebus'
import * as Type  from '../../../src/shared/types'

const props = defineProps<{
  metadata:    Type.Metadata
  writeBufLen: number
  maxCaptures: number
  timeoutMs:   number
  capturing:   boolean
  targetReady: boolean
  autoStart:   boolean
}>()
const { metadata, writeBufLen, maxCaptures, 
        timeoutMs, capturing, targetReady, autoStart: autoStartProp } = toRefs(props)

const emit = defineEmits<{
  (e: 'setAutoStart', v: boolean): void
  (e: 'setWriteBufLen', v: number): void
  (e: 'setMaxCaptures', v: number): void
  (e: 'setTimeout', v: number): void
}>()


const autoStart = ref<boolean>(autoStartProp.value)
const hint = ref<string | null>(null)
const writeBufLenStr = ref(String(writeBufLen.value))
const maxCapturesStr = ref(String(maxCaptures.value))
const timeoutStr = ref(String(timeoutMs.value))

// Watch props and update local refs
watch(autoStartProp, (newVal) => { autoStart.value = newVal })
watch(writeBufLen, (newVal) => { writeBufLenStr.value = String(newVal) })
watch(maxCaptures, (newVal) => { maxCapturesStr.value = String(newVal) })
watch(timeoutMs, (newVal) => { timeoutStr.value = String(newVal) })

function toggleHint(id: string) {
  hint.value = hint.value === id ? null : id
}

function parsePositiveInt(str: string): number | null {
  if(!/^\d+$/.test(str)) return null
  const n = parseInt(str,10)
  return n > 0 ? n : null
}

function parseNonNegInt(str: string): number | null {
  if(!/^\d+$/.test(str)) return null
  return parseInt(str,10)
}

function onWriteBufLen() {
  const n = parsePositiveInt(writeBufLenStr.value)
  if(n!==null) emit('setWriteBufLen', n)
}

function onMaxCaptures() {
  const n = parseNonNegInt(maxCapturesStr.value)
  if(n!==null) emit('setMaxCaptures', n)
}

function onTimeout() {
  const n = parseNonNegInt(timeoutStr.value)
  if(n!==null) emit('setTimeout', n)
}
</script>

<style scoped>
.section {
  padding: 0.5rem 3rem 0.5rem 3rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: relative;
}
.row {
  display: flex;
}
.wrap { flex-wrap: wrap; }
.gap { gap: 0.75rem; }
.btn {
  background: #f4f4f4;
  border: 1px solid #bbb;
  padding: 0.4rem 0.75rem;
  border-radius: 4px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.8rem;
  transition: background-color 120ms;
}
.btn:hover { background: #e9eef9; }
.btn:active { background: #dbe4f7; }
.chk-label { display: flex; align-items: center; gap: 0.35rem; }
.field { display: flex; flex-direction: column; gap: 0.35rem; min-width: 11rem; }
.lbl { font-weight: 600; letter-spacing: 0.5px; font-size: 0.7rem; text-transform: uppercase; color:#555; display:flex; align-items:center; gap:0.35rem; }
input[type=text] { padding:0.3rem 0.45rem; border:1px solid #bbb; border-radius:4px; font-size:0.8rem; }
input[type=text]:focus { outline:2px solid #4d90fe33; }
.hint-icon {
  display:inline-flex;
  width: 1.1rem; height: 1.1rem;
  border-radius: 50%;
  background:#eef2fa;
  align-items:center; justify-content:center;
  font-size:0.65rem; font-weight:600;
  cursor:pointer; color:#445;
  border:1px solid #ccd4e2;
}
.hint-icon:hover { background:#dbe4f7; }
</style>

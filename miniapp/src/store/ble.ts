import { create } from 'zustand';
import type {
  BLEConnectionStatus,
  BLEDevice,
  BLECharacteristic,
  SendMode
} from '@/types/ble';

interface BLEStore {
  status: BLEConnectionStatus;
  devices: BLEDevice[];
  currentDevice: BLEDevice | null;
  writeChar: BLECharacteristic | null;
  notifyChar: BLECharacteristic | null;
  sendMode: SendMode;
  lastCommand: number | null;
  sentCount: number;
  errorMessage: string | null;

  setStatus: (s: BLEConnectionStatus) => void;
  addDevice: (d: BLEDevice) => void;
  clearDevices: () => void;
  setCurrentDevice: (d: BLEDevice | null) => void;
  setWriteChar: (c: BLECharacteristic | null) => void;
  setNotifyChar: (c: BLECharacteristic | null) => void;
  setSendMode: (m: SendMode) => void;
  setLastCommand: (b: number | null) => void;
  incSentCount: () => void;
  setError: (e: string | null) => void;
  resetAll: () => void;
}

export const useBLEStore = create<BLEStore>((set) => ({
  status: 'closed',
  devices: [],
  currentDevice: null,
  writeChar: null,
  notifyChar: null,
  sendMode: 'HEX',
  lastCommand: null,
  sentCount: 0,
  errorMessage: null,

  setStatus: (s) => set({ status: s }),
  addDevice: (d) =>
    set((state) => {
      if (state.devices.some((x) => x.deviceId === d.deviceId)) return state;
      return { devices: [...state.devices, d] };
    }),
  clearDevices: () => set({ devices: [] }),
  setCurrentDevice: (d) => set({ currentDevice: d }),
  setWriteChar: (c) => set({ writeChar: c }),
  setNotifyChar: (c) => set({ notifyChar: c }),
  setSendMode: (m) => set({ sendMode: m }),
  setLastCommand: (b) => set({ lastCommand: b }),
  incSentCount: () => set((s) => ({ sentCount: s.sentCount + 1 })),
  setError: (e) => set({ errorMessage: e }),
  resetAll: () =>
    set({
      status: 'closed',
      currentDevice: null,
      writeChar: null,
      notifyChar: null,
      errorMessage: null
    })
}));

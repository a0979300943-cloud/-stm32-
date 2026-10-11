import { useCallback } from 'react';
import Taro from '@tarojs/taro';
import type {
  BLEDevice,
  BLEService,
  BLECharacteristic
} from '@/types/ble';
import { useBLEStore } from '@/store/ble';

// 常見 BLE 透傳 Service/Characteristic UUID（兼容 JDY-31M、HC-08、AT-09、CC2541、NUS）
const NORMALIZE = (s: string) => s.toUpperCase().replace(/-/g, '');

const CANDIDATE_SERVICE_UUIDS = [
  '0000FFE000001000800000805F9B34FB',
  '6E400001B5A3F393E0A9E50E24DCCA9E',
  'FFE0'
];
const CANDIDATE_WRITE_UUIDS = [
  '0000FFE100001000800000805F9B34FB',
  '6E400002B5A3F393E0A9E50E24DCCA9E',
  'FFE1'
];
const CANDIDATE_NOTIFY_UUIDS = [
  '0000FFE100001000800000805F9B34FB',
  '6E400003B5A3F393E0A9E50E24DCCA9E',
  'FFE1'
];

const isIn = (list: string[], x: string) =>
  list.some((u) => NORMALIZE(u).includes(NORMALIZE(x)) || NORMALIZE(x).includes(NORMALIZE(u)));

/**
 * 模組級狀態（多頁共用同一個 Hook 時保持一致）
 *  - 避免切換 TabBar 頁面時重複初始化 / 誤斷線
 *  - 避免重複註冊全局 onBLECharacteristicValueChange
 */
let moduleAdapterReady = false;
let moduleNotifyListenerRegistered = false;
let moduleScanListenerOn = false;
let moduleAutoStopTimer: ReturnType<typeof setTimeout> | null = null;

export function useBluetoothLE() {
  const store = useBLEStore();

  const setError = useCallback(
    (msg: string, err?: unknown) => {
      console.error('[BLE]', msg, err ?? '');
      store.setError(msg);
      store.setStatus('error');
    },
    [store]
  );

  // =========================================================================
  // 1. 初始化藍牙適配器（全局只做一次，除非明確發生錯誤）
  // =========================================================================
  const initAdapter = useCallback(async (): Promise<boolean> => {
    try {
      if (process.env.TARO_ENV === 'h5') {
        Taro.showToast({ title: 'H5 不支持 BLE，請用微信小程序', icon: 'none', duration: 2500 });
        return false;
      }
      if (moduleAdapterReady) {
        store.setError(null);
        return true;
      }
      // 先嚐試關閉一次，避免進程重啟時適配器殘留狀態
      try { await Taro.closeBluetoothAdapter(); } catch (_) { /* ignore */ }
      await Taro.openBluetoothAdapter();
      moduleAdapterReady = true;
      store.setError(null);
      console.log('[BLE] 適配器已開啟');
      return true;
    } catch (e) {
      moduleAdapterReady = false;
      setError('無法開啟藍牙適配器（請確認已開啟手機藍牙與定位權限）', e);
      return false;
    }
  }, [store, setError]);

  // =========================================================================
  // 2. 掃描 / 停止掃描
  // =========================================================================
  const stopScan = useCallback(async () => {
    try {
      await Taro.stopBluetoothDevicesDiscovery();
    } catch (e) {
      console.warn('[BLE] stopScan 忽略', e);
    }
    if (moduleScanListenerOn) {
      try { Taro.offBluetoothDeviceFound(); } catch (_) { /* ignore */ }
      moduleScanListenerOn = false;
    }
    if (moduleAutoStopTimer) {
      clearTimeout(moduleAutoStopTimer);
      moduleAutoStopTimer = null;
    }
    if (store.status === 'scanning') store.setStatus('closed');
    console.log('[BLE] 停止掃描');
  }, [store]);

  const startScan = useCallback(async () => {
    if (!moduleAdapterReady) {
      const ok = await initAdapter();
      if (!ok) return;
    }
    try {
      store.clearDevices();
      store.setStatus('scanning');

      // 避免重複 onBluetoothDeviceFound 註冊
      if (moduleScanListenerOn) {
        try { Taro.offBluetoothDeviceFound(); } catch (_) { /* ignore */ }
        moduleScanListenerOn = false;
      }
      Taro.onBluetoothDeviceFound((res) => {
        const devices = res.devices as BLEDevice[];
        devices.forEach((d) => {
          const name = d.name || d.localName || '未命名設備';
          store.addDevice({
            deviceId: d.deviceId,
            name: name === '未知设备' || !name ? `BLE-${d.deviceId.slice(-6)}` : name,
            RSSI: d.RSSI,
            advertisServiceUUIDs: d.advertisServiceUUIDs,
            localName: d.localName
          });
        });
      });
      moduleScanListenerOn = true;

      await Taro.startBluetoothDevicesDiscovery({
        allowDuplicatesKey: false,
        interval: 300,
        powerLevel: 'high'
      });
      console.log('[BLE] 開始掃描');
      if (moduleAutoStopTimer) clearTimeout(moduleAutoStopTimer);
      moduleAutoStopTimer = setTimeout(() => stopScan(), 10_000);
    } catch (e) {
      setError('掃描失敗', e);
    }
  }, [store, initAdapter, setError, stopScan]);

  // =========================================================================
  // 3. 連接 / 斷開
  // =========================================================================
  const disconnect = useCallback(async () => {
    try {
      const d = store.currentDevice;
      if (d && d.deviceId) {
        try {
          const nc = store.notifyChar;
          if (nc) {
            await Taro.notifyBLECharacteristicValueChange({
              deviceId: d.deviceId,
              serviceId: nc.serviceId,
              characteristicId: nc.uuid,
              state: false
            }).catch(() => {});
          }
        } catch (_) { /* ignore */ }
        try { await Taro.closeBLEConnection({ deviceId: d.deviceId }); } catch (_) { /* ignore */ }
      }
    } catch (e) {
      console.warn('[BLE] disconnect 忽略', e);
    } finally {
      store.resetAll();
    }
  }, [store]);

  const connect = useCallback(async (device: BLEDevice) => {
    await stopScan();
    store.setStatus('connecting');
    store.setCurrentDevice(device);
    try {
      await Taro.createBLEConnection({ deviceId: device.deviceId, timeout: 10000 });
      store.setStatus('connected');

      await new Promise((r) => setTimeout(r, 600));

      const { services } = (await Taro.getBLEDeviceServices({
        deviceId: device.deviceId
      })) as unknown as { services: BLEService[] };
      console.log('[BLE] 發現 services:', services);

      let matchedService: BLEService | null = null;
      for (const svc of services) {
        if (isIn(CANDIDATE_SERVICE_UUIDS, svc.uuid) || svc.uuid.toUpperCase().includes('FFE0')) {
          matchedService = svc; break;
        }
      }
      if (!matchedService && services.length > 0) matchedService = services[0];
      if (!matchedService) throw new Error('未找到任何 Service');

      const { characteristics } = (await Taro.getBLEDeviceCharacteristics({
        deviceId: device.deviceId,
        serviceId: matchedService.uuid
      })) as unknown as { characteristics: BLECharacteristic[] };
      console.log('[BLE] 發現 characteristics:', characteristics);

      let writeChar: BLECharacteristic | null = null;
      let notifyChar: BLECharacteristic | null = null;
      for (const ch of characteristics) {
        const writeOK = ch.properties && ch.properties.write;
        const notifyOK = ch.properties && (ch.properties.notify || ch.properties.indicate);
        if (writeChar == null && writeOK && isIn(CANDIDATE_WRITE_UUIDS, ch.uuid)) {
          writeChar = { ...ch, serviceId: matchedService!.uuid };
        }
        if (notifyChar == null && notifyOK && isIn(CANDIDATE_NOTIFY_UUIDS, ch.uuid)) {
          notifyChar = { ...ch, serviceId: matchedService!.uuid };
        }
      }
      if (!writeChar) {
        const first = characteristics.find((c) => c.properties && c.properties.write);
        if (first) writeChar = { ...first, serviceId: matchedService.uuid };
      }
      if (!notifyChar) {
        const first = characteristics.find((c) => c.properties && (c.properties.notify || c.properties.indicate));
        if (first) notifyChar = { ...first, serviceId: matchedService.uuid };
      }
      if (!writeChar) throw new Error('未找到可寫入的特徵值（請確認模組是標準 BLE 透傳服務）');
      store.setWriteChar(writeChar);
      store.setNotifyChar(notifyChar);

      // 開啟 Notify（全局註冊一次即可）
      if (notifyChar) {
        try {
          await Taro.notifyBLECharacteristicValueChange({
            deviceId: device.deviceId,
            serviceId: notifyChar.serviceId,
            characteristicId: notifyChar.uuid,
            state: true
          });
          if (!moduleNotifyListenerRegistered) {
            Taro.onBLECharacteristicValueChange((res) => {
              const arr = new Uint8Array(res.value as ArrayBuffer);
              console.log('[BLE] ← RX bytes:', Array.from(arr));
            });
            moduleNotifyListenerRegistered = true;
          }
        } catch (ne) {
          console.warn('[BLE] 開啟 Notify 失敗（不影響發送）', ne);
        }
      }

      store.setStatus('ready');
      store.setError(null);
      Taro.showToast({ title: '已連接', icon: 'success' });
    } catch (e) {
      setError('連接失敗: ' + (e as Error).message, e);
      try { await disconnect(); } catch (_) { /* ignore */ }
    }
  }, [store, stopScan, setError, disconnect]);

  // =========================================================================
  // 4. 發送字節
  // =========================================================================
  const writeBuffer = useCallback(async (buf: ArrayBuffer): Promise<boolean> => {
    if (store.status !== 'ready' || !store.currentDevice || !store.writeChar) {
      Taro.showToast({ title: '請先連接藍牙', icon: 'none' });
      return false;
    }
    try {
      await Taro.writeBLECharacteristicValue({
        deviceId: store.currentDevice.deviceId,
        serviceId: store.writeChar.serviceId,
        characteristicId: store.writeChar.uuid,
        value: buf
      });
      store.incSentCount();
      return true;
    } catch (e) {
      setError('寫入失敗，請重新連接', e);
      return false;
    }
  }, [store, setError]);

  // ⚠️ 注意：這裡**不再**使用 useEffect 自動斷線
  // 原因：Hook 在 3 個 TabBar 頁面各自實例化，切換 Tab 時如果自動斷線會導致連線中斷
  // 僅在用戶主動點擊「斷開」或全局異常時才真正斷線

  return {
    store,
    initAdapter,
    startScan,
    stopScan,
    connect,
    disconnect,
    writeBuffer
  };
}

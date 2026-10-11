import React, { useCallback, useEffect } from 'react';
import { View, Button, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import DeviceCard from '@/components/DeviceCard';
import { useBluetoothLE } from '@/hooks/useBluetoothLE';
import type { BLEDevice } from '@/types/ble';
import styles from './index.module.scss';

const BluetoothPage: React.FC = () => {
  const ble = useBluetoothLE();
  const scanning = ble.store.status === 'scanning';

  // 進入頁面自動嘗試初始化適配器
  useEffect(() => {
    ble.initAdapter();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScan = useCallback(async () => {
    if (scanning) { await ble.stopScan(); return; }
    await ble.startScan();
  }, [ble, scanning]);

  const handleConnect = useCallback(async (d: BLEDevice) => {
    Taro.showLoading({ title: '連接中...', mask: true });
    try {
      await ble.connect(d);
    } finally {
      Taro.hideLoading();
    }
  }, [ble]);

  const handleDisconnect = useCallback(async () => {
    Taro.showLoading({ title: '斷開中...', mask: true });
    try {
      await ble.disconnect();
    } finally {
      Taro.hideLoading();
    }
  }, [ble]);

  return (
    <ScrollView scrollY className={styles.page}>
      <View className={styles.headerCard}>
        <View className={styles.headerRow}>
          <Button
            className={scanning ? styles.stopBtn : styles.scanBtn}
            hoverClass="none"
            onClick={handleScan}
          >
            {scanning ? '停止掃描' : '開始掃描設備'}
          </Button>
        </View>
        <View className={styles.tip}>
          <Text>● 請確認手機已開啟藍牙與定位權限（iOS 掃描需定位）</Text>{'\n'}
          <Text>● 常見兼容模組：JDY-31M、HC-08、AT-09、CC2541（BLE 透傳服務 UUID FFE0/FFE1 或 NUS）</Text>{'\n'}
          <Text>● JDY-31 經典版（非 BLE）iOS 不支持，建議更換為 JDY-31M BLE 版本</Text>
        </View>
      </View>

      <View className={styles.listTitle}>
        <Text>
          {scanning && <View className={styles.scanningDot} />}
          設備列表（{ble.store.devices.length}）
        </Text>
        <Text style={{ color: '#94A3B8', fontSize: 24 }} onClick={() => ble.store.clearDevices()}>清空</Text>
      </View>

      {ble.store.devices.length === 0 ? (
        <View className={styles.empty}>
          {scanning ? '正在搜索 BLE 設備...' : '暫無設備，點擊上方「開始掃描」'}
        </View>
      ) : (
        ble.store.devices.map((d) => (
          <DeviceCard
            key={d.deviceId}
            device={d}
            isCurrent={ble.store.currentDevice?.deviceId === d.deviceId}
            onConnect={() => handleConnect(d)}
            onDisconnect={handleDisconnect}
          />
        ))
      )}

      {ble.store.currentDevice && (
        <View style={{ marginTop: 32 }}>
          <Button
            className={styles.stopBtn}
            style={{ width: '100%' }}
            hoverClass="none"
            onClick={handleDisconnect}
          >
            斷開當前連接
          </Button>
        </View>
      )}

      {ble.store.errorMessage && (
        <View style={{ marginTop: 32, color: '#EF4444', fontSize: 24, padding: '0 8rpx' }}>
          錯誤信息：{ble.store.errorMessage}
        </View>
      )}
    </ScrollView>
  );
};

export default BluetoothPage;

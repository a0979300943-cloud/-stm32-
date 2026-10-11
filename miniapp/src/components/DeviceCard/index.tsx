import React from 'react';
import { View, Button, Text } from '@tarojs/components';
import classNames from 'classnames';
import type { BLEDevice } from '@/types/ble';
import styles from './index.module.scss';

interface DeviceCardProps {
  device: BLEDevice;
  isCurrent: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

const DeviceCard: React.FC<DeviceCardProps> = ({ device, isCurrent, onConnect, onDisconnect }) => {
  return (
    <View className={styles.card}>
      <View className={styles.left}>
        <View className={styles.name}>{device.name}</View>
        <View className={styles.meta}>
          <Text selectable>{device.deviceId}</Text>
          {isCurrent && <Text className={styles.connectedTag}>● 已連接</Text>}
        </View>
      </View>
      <View className={styles.right}>
        <Text className={styles.rssiTag}>RSSI {device.RSSI}</Text>
        <View style={{ width: 16 }} />
        {isCurrent ? (
          <Button className={styles.disconnectBtn} hoverClass="none" onClick={onDisconnect}>斷開</Button>
        ) : (
          <Button className={styles.connectBtn} hoverClass="none" onClick={onConnect}>連接</Button>
        )}
      </View>
    </View>
  );
};

export default DeviceCard;

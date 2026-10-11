import React, { useMemo } from 'react';
import { View, Slider, Text } from '@tarojs/components';
import classNames from 'classnames';
import type { BLEConnectionStatus, BLEDevice } from '@/types/ble';
import styles from './index.module.scss';

interface ConnectionCardProps {
  status: BLEConnectionStatus;
  device: BLEDevice | null;
  lastCommand: number | null;
  sentCount: number;
  speed: number;
  onSpeedChange?: (val: number) => void;
}

const STATUS_TEXT: Record<BLEConnectionStatus, string> = {
  closed:     '未連接',
  scanning:   '掃描中',
  connecting: '連接中',
  connected:  'GATT 已連接',
  ready:      '可發送指令',
  error:      '錯誤'
};

const ConnectionCard: React.FC<ConnectionCardProps> = ({
  status, device, lastCommand, sentCount, speed, onSpeedChange
}) => {
  const statusCls = useMemo(() => {
    switch (status) {
      case 'ready': return styles.ready;
      case 'connected': return styles.connected;
      case 'scanning': case 'connecting': return styles.connecting;
      case 'error': return styles.error;
      default: return styles.closed;
    }
  }, [status]);

  const cmdStr = lastCommand == null ? '—' : `0x${lastCommand.toString(16).padStart(2, '0').toUpperCase()}`;

  return (
    <View className={styles.card}>
      <View className={styles.headerRow}>
        <View className={styles.title}>{device?.name ?? '尚未選擇設備'}</View>
        <View className={classNames(styles.statusPill, statusCls)}>
          <View className={styles.dot} style={{ background: 'currentColor' }} />
          {STATUS_TEXT[status]}
        </View>
      </View>

      <View className={styles.infoGrid}>
        <View className={styles.infoItem}>
          <View className={styles.infoLabel}>設備 ID</View>
          <View className={styles.infoValue}>{device?.deviceId ?? '—'}</View>
        </View>
        <View className={styles.infoItem}>
          <View className={styles.infoLabel}>信號 RSSI</View>
          <View className={styles.infoValue}>{device ? `${device.RSSI} dBm` : '—'}</View>
        </View>
        <View className={styles.infoItem}>
          <View className={styles.infoLabel}>上次發送</View>
          <View className={styles.infoValue}>{cmdStr}</View>
        </View>
        <View className={styles.infoItem}>
          <View className={styles.infoLabel}>已發送次數</View>
          <View className={styles.infoValue}>{sentCount}</View>
        </View>
      </View>

      <View className={styles.speedRow}>
        <View className={styles.speedLabel}>
          <Text>速度油門（測速/試驗用）</Text>
          <Text>{speed}%</Text>
        </View>
        <Slider
          min={0}
          max={100}
          value={speed}
          step={5}
          activeColor="#00E0FF"
          backgroundColor="rgba(0,224,255,0.15)"
          blockColor="#00E0FF"
          blockSize={24}
          showValue={false}
          onChange={(e) => onSpeedChange?.(e.detail.value)}
        />
      </View>
    </View>
  );
};

export default ConnectionCard;

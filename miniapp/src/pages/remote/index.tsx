import React, { useCallback, useState } from 'react';
import { View, Button, Input, Text, ScrollView } from '@tarojs/components';
import Taro from '@tarojs/taro';
import DirectionPad from '@/components/DirectionPad';
import ConnectionCard from '@/components/ConnectionCard';
import { CarCommand, COMMAND_TABLE } from '@/types/ble';
import { commandToBuffer, parseManualInput } from '@/utils/command';
import { toBuffer, bytesToHex } from '@/utils/hex';
import { useBluetoothLE } from '@/hooks/useBluetoothLE';
import styles from './index.module.scss';

const RemotePage: React.FC = () => {
  const ble = useBluetoothLE();
  const [speed, setSpeed] = useState<number>(50);
  const [manual, setManual] = useState<string>('');
  const ready = ble.store.status === 'ready';
  const mode = ble.store.sendMode;

  const sendCommand = useCallback(async (cmd: CarCommand) => {
    const buf = commandToBuffer(cmd, mode);
    const ok = await ble.writeBuffer(buf);
    if (ok) {
      ble.store.setLastCommand(cmd);
      const meta = COMMAND_TABLE.find((c) => c.code === cmd);
      console.log('[Remote] → 指令:', meta?.label ?? cmd, 'mode=', mode);
    }
  }, [ble, mode]);

  const sendManual = useCallback(async () => {
    const bytes = parseManualInput(manual, mode);
    if (!bytes || bytes.length === 0) {
      Taro.showToast({ title: '請輸入有效的字節', icon: 'none' });
      return;
    }
    const buf = toBuffer(bytes);
    const ok = await ble.writeBuffer(buf);
    if (ok && bytes.length === 1) ble.store.setLastCommand(bytes[0]);
    Taro.showToast({ title: `已發送 ${bytesToHex(bytes)}`, icon: 'none' });
  }, [ble, manual, mode]);

  const sendEmergencyStop = useCallback(async () => {
    // 直接發 STOP，不論模式都用字節 0x00，確保安全
    await ble.writeBuffer(toBuffer([0x00]));
    ble.store.setLastCommand(0x00);
  }, [ble]);

  return (
    <ScrollView scrollY className={`${styles.page} no-select`}>
      <ConnectionCard
        status={ble.store.status}
        device={ble.store.currentDevice}
        lastCommand={ble.store.lastCommand}
        sentCount={ble.store.sentCount}
        speed={speed}
        onSpeedChange={setSpeed}
      />

      {ble.store.errorMessage && (
        <View style={{ color: '#EF4444', fontSize: 24, marginBottom: 16, padding: '0 8rpx' }}>
          錯誤：{ble.store.errorMessage}
        </View>
      )}

      <View className={styles.sectionTitle}>
        <Text>方向控制</Text>
        <Text className={styles.subTitle}>模式：{mode}　{ready ? '● 在線' : '○ 未就緒'}</Text>
      </View>

      <View className={styles.padWrap}>
        <DirectionPad disabled={!ready} onCommand={sendCommand} />
      </View>

      <View className={styles.funcRow}>
        <Button className={`${styles.funcBtn} ${styles.avoid}`} hoverClass="none" disabled={!ready} onClick={() => sendCommand(CarCommand.AVOID)}>
          <Text className={styles.funcTitle}>避障模式</Text>
          <Text className={styles.funcSub}>0x05 / 按鍵 5</Text>
        </Button>
        <Button className={`${styles.funcBtn} ${styles.track}`} hoverClass="none" disabled={!ready} onClick={() => sendCommand(CarCommand.TRACK)}>
          <Text className={styles.funcTitle}>循跡模式</Text>
          <Text className={styles.funcSub}>0x06 / 按鍵 6</Text>
        </Button>
        <Button className={`${styles.funcBtn} ${styles.ledOn}`} hoverClass="none" disabled={!ready} onClick={() => sendCommand(CarCommand.LED_ON)}>
          <Text className={styles.funcTitle}>開啟 LED</Text>
          <Text className={styles.funcSub}>0x07 / 按鍵 7</Text>
        </Button>
        <Button className={`${styles.funcBtn} ${styles.ledOff}`} hoverClass="none" disabled={!ready} onClick={() => sendCommand(CarCommand.LED_OFF)}>
          <Text className={styles.funcTitle}>關閉 LED</Text>
          <Text className={styles.funcSub}>0x08 / 按鍵 8</Text>
        </Button>
      </View>

      <View className={styles.manualCard}>
        <View className={styles.manualLabel}>
          <Text>手動發送</Text>
          <Text className={styles.modeTag}>
            {mode === 'HEX' ? 'HEX（如 01 02 00）' : 'ASCII（如 1 前進）'}
          </Text>
        </View>
        <Input
          className={styles.manualInput}
          placeholder={mode === 'HEX' ? '輸入 HEX 字節，例如 01' : '輸入字符，例如 1'}
          value={manual}
          onInput={(e) => setManual(e.detail.value)}
          confirmType="send"
          onConfirm={sendManual}
        />
        <View className={styles.sendRow}>
          <Button className={styles.smallBtn} hoverClass="none" onClick={sendEmergencyStop}>緊急停車</Button>
          <Button className={styles.sendBtn}  hoverClass="none" onClick={sendManual}>發送</Button>
        </View>
      </View>
    </ScrollView>
  );
};

export default RemotePage;

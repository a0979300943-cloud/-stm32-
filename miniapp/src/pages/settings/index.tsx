import React, { useCallback } from 'react';
import { View, Text, Switch, Button } from '@tarojs/components';
import Taro, { useRouter } from '@tarojs/taro';
import { useBLEStore } from '@/store/ble';
import { COMMAND_TABLE, CarCommand, SendMode } from '@/types/ble';
import { commandToBuffer } from '@/utils/command';
import { useBluetoothLE } from '@/hooks/useBluetoothLE';
import styles from './index.module.scss';

const SettingsPage: React.FC = () => {
  const store = useBLEStore();
  const ble = useBluetoothLE();
  const router = useRouter();

  const onModeChange = useCallback((e) => {
    const mode: SendMode = e.detail.value ? 'ASCII' : 'HEX';
    store.setSendMode(mode);
  }, [store]);

  const clearCache = useCallback(() => {
    Taro.showModal({
      title: '確認清空？',
      content: '將會斷開當前連接並清空設備列表。',
      success: async (r) => {
        if (r.confirm) {
          await ble.disconnect();
          store.clearDevices();
          Taro.showToast({ title: '已清空', icon: 'success' });
        }
      }
    });
  }, [ble, store]);

  const sendShortcut = useCallback(async (code: CarCommand) => {
    const buf = commandToBuffer(code, store.sendMode);
    const ok = await ble.writeBuffer(buf);
    if (ok) store.setLastCommand(code);
  }, [ble, store]);

  return (
    <View className={styles.page}>
      <View className={styles.card}>
        <View className={styles.cardTitle}>發送模式</View>
        <View className={styles.row}>
          <View className={styles.leftCol}>
            <View className={styles.label}>ASCII / HEX</View>
            <View className={styles.subLabel}>
              關：HEX（發 0x01~0x08 字節）　開：ASCII（發字符 '0'~'8'）
            </View>
          </View>
          <Switch
            checked={store.sendMode === 'ASCII'}
            onChange={onModeChange}
            color="#00E0FF"
          />
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>指令協議對照表</View>
        <View className={styles.pairCard} style={{ color: '#94A3B8', fontSize: 24 }}>
          <View>HEX</View><View>功能</View><View style={{textAlign:'right'}}>ASCII</View><View></View>
        </View>
        {COMMAND_TABLE.map((r) => (
          <View className={styles.pairCard} key={r.code}>
            <View className={styles.codeCell}>{r.code.toString(16).toUpperCase().padStart(2, '0')}</View>
            <View>
              <View className={styles.labelCell}>{r.label}</View>
              <View className={styles.subLabel} style={{ fontSize: 22 }}>{r.hint}</View>
            </View>
            <View className={styles.asciiCell}>{r.ascii}</View>
            <View className={styles.btnCell}>
              <Button
                className={styles.ghostBtn}
                hoverClass="none"
                onClick={() => sendShortcut(r.code)}
              >
                試發
              </Button>
            </View>
          </View>
        ))}
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>藍牙配置</View>
        <View className={styles.row}>
          <View className={styles.leftCol}>
            <View className={styles.label}>當前連接狀態</View>
            <View className={styles.subLabel}>
              {store.currentDevice ? `${store.currentDevice.name}（${store.status}）` : '未連接'}
            </View>
          </View>
          <Button className={styles.ghostBtn} hoverClass="none" onClick={() => Taro.switchTab({ url: '/pages/bluetooth/index' })}>去連接</Button>
        </View>
        <View className={styles.row}>
          <View className={styles.leftCol}>
            <View className={styles.label}>斷開並清空本地緩存</View>
            <View className={styles.subLabel}>斷開連接、清空已掃描設備列表</View>
          </View>
          <Button className={styles.dangerBtn} hoverClass="none" onClick={clearCache}>清空</Button>
        </View>
      </View>

      <View className={styles.card}>
        <View className={styles.cardTitle}>關於</View>
        <View className={styles.about}>
          <View>版本：1.0.0（STM32 智能車配套遙控）</View>
          <View>藍牙協議：BLE（GATT 透傳，兼容 FFE0/FFE1 與 NUS）</View>
          <View>默認波特率：JDY-31 9600、HC-08 9600</View>
          <View>
            更多指令：
            <Text className={styles.link} onClick={() => Taro.navigateTo({ url: '/pages/command/index' })}> 查看詳細 →</Text>
          </View>
          <View>
            日誌：
            <Text className={styles.link} onClick={() => Taro.navigateTo({ url: '/pages/logs/index' })}> 查看歷史 →</Text>
          </View>
          {router.params?.['from'] && <View>跳轉參數：{JSON.stringify(router.params)}</View>}
        </View>
      </View>
    </View>
  );
};

export default SettingsPage;

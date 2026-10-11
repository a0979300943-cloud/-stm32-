import React from 'react';
import { View, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const LogsPage: React.FC = () => {
  return (
    <View className={styles.page}>
      <View className={styles.wrap}>
        <View className={styles.title}>發送 / 接收日誌</View>
        <View className={styles.desc}>
          功能正在開發中...{'\n'}
          後續可在此頁查看 BLE 收發的歷史字節、RSSI 曲線、延遲分佈等。
        </View>
        <Button className={styles.backBtn} hoverClass="none" onClick={() => Taro.switchTab({ url: '/pages/remote/index' })}>返回遙控</Button>
      </View>
    </View>
  );
};

export default LogsPage;

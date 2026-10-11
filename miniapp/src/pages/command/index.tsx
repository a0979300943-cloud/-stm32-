import React from 'react';
import { View, Button, Text } from '@tarojs/components';
import Taro from '@tarojs/taro';
import styles from './index.module.scss';

const CommandPage: React.FC = () => {
  return (
    <View className={styles.page}>
      <View className={styles.wrap}>
        <View className={styles.title}>指令詳細功能</View>
        <View className={styles.desc}>
          功能正在開發中...{'\n'}
          後續可在此頁展示每條指令的詳細字節格式、參數說明、軌跡回放等。
        </View>
        <Button className={styles.backBtn} hoverClass="none" onClick={() => Taro.switchTab({ url: '/pages/settings/index' })}>返回設置</Button>
      </View>
    </View>
  );
};

export default CommandPage;

import React, { useCallback } from 'react';
import { View, Button } from '@tarojs/components';
import { CarCommand } from '@/types/ble';
import styles from './index.module.scss';

interface DirectionPadProps {
  disabled?: boolean;
  onCommand: (cmd: CarCommand) => void;
}

const DirectionPad: React.FC<DirectionPadProps> = ({ disabled, onCommand }) => {
  const emit = useCallback(
    (cmd: CarCommand) => () => { if (!disabled) onCommand(cmd); },
    [disabled, onCommand]
  );
  return (
    <View className={styles.pad}>
      <View className={styles.base} />
      <Button className={`${styles.btn} ${styles.up}`}    hoverClass="none" onClick={emit(CarCommand.FORWARD)}>
        <View className={styles.arrow} />
      </Button>
      <Button className={`${styles.btn} ${styles.down}`}  hoverClass="none" onClick={emit(CarCommand.BACKWARD)}>
        <View className={styles.arrow} />
      </Button>
      <Button className={`${styles.btn} ${styles.left}`}  hoverClass="none" onClick={emit(CarCommand.LEFT)}>
        <View className={styles.arrow} />
      </Button>
      <Button className={`${styles.btn} ${styles.right}`} hoverClass="none" onClick={emit(CarCommand.RIGHT)}>
        <View className={styles.arrow} />
      </Button>
      <Button className={styles.centerStop} hoverClass="none" onClick={emit(CarCommand.STOP)}>
        STOP
      </Button>
      <View className={styles.labelRow}>
        <View>左轉</View><View>後退</View><View>右轉</View>
      </View>
    </View>
  );
};

export default DirectionPad;

// 藍牙與遙控相關類型定義

export type BLEConnectionStatus =
  | 'closed'       // 完全未連接
  | 'scanning'     // 掃描中
  | 'connecting'   // 連接中
  | 'connected'    // 已連接 GATT
  | 'ready'        // 已找到可寫特徵值，可發送指令
  | 'error';       // 錯誤

export interface BLEDevice {
  deviceId: string;
  name: string;
  RSSI: number;
  advertisServiceUUIDs?: string[];
  localName?: string;
}

export interface BLEService {
  uuid: string;
  isPrimary: boolean;
}

export interface BLECharacteristic {
  uuid: string;
  serviceId: string;
  properties: {
    read: boolean;
    write: boolean;
    notify: boolean;
    indicate: boolean;
  };
}

export type SendMode = 'HEX' | 'ASCII';

// 與固件協議完全對應的指令字節（單字節）
export enum CarCommand {
  STOP     = 0x00,
  FORWARD  = 0x01,
  BACKWARD = 0x02,
  LEFT     = 0x03,
  RIGHT    = 0x04,
  AVOID    = 0x05,
  TRACK    = 0x06,
  LED_ON   = 0x07,
  LED_OFF  = 0x08
}

export interface CommandMeta {
  code: CarCommand;
  ascii: string;
  label: string;
  hint: string;
}

export const COMMAND_TABLE: CommandMeta[] = [
  { code: CarCommand.STOP,     ascii: '0', label: '停止', hint: '立即停止所有電機' },
  { code: CarCommand.FORWARD,  ascii: '1', label: '前進', hint: '雙輪正轉 (50, 50)' },
  { code: CarCommand.BACKWARD, ascii: '2', label: '後退', hint: '雙輪反轉 (-40, -40)' },
  { code: CarCommand.LEFT,     ascii: '3', label: '左轉', hint: '左反右正 (-40, 40)' },
  { code: CarCommand.RIGHT,    ascii: '4', label: '右轉', hint: '左正右反 (40, -40)' },
  { code: CarCommand.AVOID,    ascii: '5', label: '避障', hint: '舵機掃描 + 避障運行' },
  { code: CarCommand.TRACK,    ascii: '6', label: '循跡', hint: '紅外循跡模式' },
  { code: CarCommand.LED_ON,   ascii: '7', label: '開燈', hint: '打開 LED 指示燈' },
  { code: CarCommand.LED_OFF,  ascii: '8', label: '關燈', hint: '關閉 LED 指示燈' }
];

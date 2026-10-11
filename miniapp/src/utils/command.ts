import { CarCommand, COMMAND_TABLE, SendMode } from '@/types/ble';
import { toBuffer } from './hex';

/** 根據當前發送模式把 CarCommand 翻譯成要發送的字節 */
export function commandToPayload(cmd: CarCommand, mode: SendMode): number[] {
  if (mode === 'ASCII') {
    const meta = COMMAND_TABLE.find((c) => c.code === cmd);
    const ch = meta ? meta.ascii.charCodeAt(0) : ('0'.charCodeAt(0) + cmd);
    return [ch & 0xff];
  }
  return [cmd & 0xff];
}

/** 將 command 轉換為 ArrayBuffer（直接用於 BLE 寫入） */
export function commandToBuffer(cmd: CarCommand, mode: SendMode): ArrayBuffer {
  return toBuffer(commandToPayload(cmd, mode));
}

/** 根據字符串指令解析 CarCommand（支持 HEX 如 "01" 或 ASCII 如 "1"） */
export function parseManualInput(input: string, mode: SendMode): number[] | null {
  const clean = input.trim();
  if (!clean) return null;
  if (mode === 'HEX') {
    const re = /[\s,]*(0x)?([0-9a-fA-F]{1,2})[\s,]*/g;
    const bytes: number[] = [];
    let m: RegExpExecArray | null;
    while ((m = re.exec(clean)) !== null) {
      bytes.push(parseInt(m[2], 16) & 0xff);
    }
    return bytes.length ? bytes : null;
  }
  // ASCII：發送字符串每個 char 的字節
  return Array.from(clean).map((c) => c.charCodeAt(0) & 0xff);
}

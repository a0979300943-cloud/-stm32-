// 十六進制 /字節緩衝區工具

export function toHex(value: number, width = 2): string {
  const s = (value >>> 0).toString(16).toUpperCase();
  return s.length >= width ? s.slice(-width) : '0'.repeat(width - s.length) + s;
}

export function bytesToHex(arr: Uint8Array | number[]): string {
  return Array.from(arr).map((b) => toHex(b)).join('');
}

export function hexToBytes(hex: string): number[] {
  const clean = hex.replace(/\s|0x/gi, '');
  const out: number[] = [];
  for (let i = 0; i < clean.length; i += 2) {
    const chunk = clean.slice(i, i + 2);
    if (chunk.length === 2) out.push(parseInt(chunk, 16) & 0xff);
  }
  return out;
}

/** 構造 ArrayBuffer，供 writeBLECharacteristicValue 使用 */
export function toBuffer(bytes: number[]): ArrayBuffer {
  const arr = new Uint8Array(bytes);
  return arr.buffer.slice(arr.byteOffset, arr.byteOffset + arr.byteLength) as ArrayBuffer;
}

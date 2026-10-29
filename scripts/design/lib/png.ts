import { deflateSync, inflateSync } from 'node:zlib';

export interface Image {
  width: number;
  height: number;
  // RGBA, 4 bytes per pixel, row by row.
  data: Uint8Array;
}

const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

function paeth(a: number, b: number, c: number) {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  if (pa <= pb && pa <= pc) return a;
  return pb <= pc ? b : c;
}

export function decodePng(buffer: Uint8Array): Image {
  const bytes = Buffer.from(buffer);
  if (!bytes.subarray(0, 8).equals(signature)) throw new Error('Not a PNG');
  let offset = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colourType = 0;
  let interlace = 0;
  let palette: Buffer | null = null;
  let transparency: Buffer | null = null;
  const idat: Buffer[] = [];
  while (offset < bytes.length) {
    const length = bytes.readUInt32BE(offset);
    const type = bytes.toString('ascii', offset + 4, offset + 8);
    const chunk = bytes.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      width = chunk.readUInt32BE(0);
      height = chunk.readUInt32BE(4);
      bitDepth = chunk[8];
      colourType = chunk[9];
      interlace = chunk[12];
    } else if (type === 'PLTE') palette = chunk;
    else if (type === 'tRNS') transparency = chunk;
    else if (type === 'IDAT') idat.push(chunk);
    else if (type === 'IEND') break;
    offset += 12 + length;
  }
  if (bitDepth !== 8 || interlace !== 0)
    throw new Error(`Unsupported PNG (bit depth ${bitDepth}, interlace ${interlace})`);
  const channels = { 0: 1, 2: 3, 3: 1, 4: 2, 6: 4 }[colourType];
  if (!channels) throw new Error(`Unsupported PNG colour type ${colourType}`);
  const raw = inflateSync(Buffer.concat(idat));
  const stride = width * channels;
  const pixels = new Uint8Array(height * stride);
  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const left = x >= channels ? pixels[y * stride + x - channels] : 0;
      const up = y > 0 ? pixels[(y - 1) * stride + x] : 0;
      const upLeft = y > 0 && x >= channels ? pixels[(y - 1) * stride + x - channels] : 0;
      const value = line[x];
      const predicted =
        filter === 1
          ? left
          : filter === 2
            ? up
            : filter === 3
              ? (left + up) >> 1
              : filter === 4
                ? paeth(left, up, upLeft)
                : 0;
      pixels[y * stride + x] = (value + predicted) & 0xff;
    }
  }
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) {
    const source = i * channels;
    const target = i * 4;
    if (colourType === 3) {
      if (!palette) throw new Error('PNG palette is missing');
      const index = pixels[source];
      data[target] = palette[index * 3];
      data[target + 1] = palette[index * 3 + 1];
      data[target + 2] = palette[index * 3 + 2];
      data[target + 3] = transparency && index < transparency.length ? transparency[index] : 255;
    } else if (channels <= 2) {
      data[target] = data[target + 1] = data[target + 2] = pixels[source];
      data[target + 3] = channels === 2 ? pixels[source + 1] : 255;
    } else {
      data[target] = pixels[source];
      data[target + 1] = pixels[source + 1];
      data[target + 2] = pixels[source + 2];
      data[target + 3] = channels === 4 ? pixels[source + 3] : 255;
    }
  }
  return { width, height, data };
}

const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});

function crc32(buffer: Buffer) {
  let crc = 0xffffffff;
  for (const byte of buffer) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type: string, data: Buffer) {
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body));
  return Buffer.concat([length, body, crc]);
}

export function encodePng(image: Image): Buffer {
  const header = Buffer.alloc(13);
  header.writeUInt32BE(image.width, 0);
  header.writeUInt32BE(image.height, 4);
  header[8] = 8;
  header[9] = 6;
  const stride = image.width * 4;
  const raw = Buffer.alloc((stride + 1) * image.height);
  for (let y = 0; y < image.height; y++) {
    raw[y * (stride + 1)] = 0;
    Buffer.from(image.data.buffer, image.data.byteOffset + y * stride, stride).copy(
      raw,
      y * (stride + 1) + 1
    );
  }
  return Buffer.concat([
    signature,
    chunk('IHDR', header),
    chunk('IDAT', deflateSync(raw)),
    chunk('IEND', Buffer.alloc(0)),
  ]);
}

export function blankImage(width: number, height: number, rgba = [255, 255, 255, 255]): Image {
  const data = new Uint8Array(width * height * 4);
  for (let i = 0; i < width * height; i++) data.set(rgba, i * 4);
  return { width, height, data };
}

// Nearest-neighbour resize: good enough to line two screenshots up.
export function resize(image: Image, width: number, height: number): Image {
  const out = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const sy = Math.min(image.height - 1, Math.floor((y * image.height) / height));
    for (let x = 0; x < width; x++) {
      const sx = Math.min(image.width - 1, Math.floor((x * image.width) / width));
      out.set(
        image.data.subarray((sy * image.width + sx) * 4, (sy * image.width + sx) * 4 + 4),
        (y * width + x) * 4
      );
    }
  }
  return { width, height, data: out };
}

export function blit(target: Image, source: Image, left: number, top: number) {
  for (let y = 0; y < source.height && top + y < target.height; y++) {
    const row = source.data.subarray(y * source.width * 4, (y + 1) * source.width * 4);
    target.data.set(
      row.subarray(0, Math.min(row.length, (target.width - left) * 4)),
      ((top + y) * target.width + left) * 4
    );
  }
}

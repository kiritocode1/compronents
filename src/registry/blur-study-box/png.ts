const PNG_SIGNATURE = Uint8Array.of(137, 80, 78, 71, 13, 10, 26, 10);
const textEncoder = new TextEncoder();
const crcTable = new Uint32Array(256);

for (let index = 0; index < 256; index += 1) {
  let value = index;
  for (let bit = 0; bit < 8; bit += 1) {
    value = value & 1 ? 3988292384 ^ (value >>> 1) : value >>> 1;
  }
  crcTable[index] = value >>> 0;
}

interface PngDestination {
  readonly kind: string;
  write(bytes: Uint8Array<ArrayBufferLike>): Promise<void> | void;
  close(): Promise<void> | void;
  getFile(): Promise<File> | File;
}

interface StorageManagerWithDirectory extends StorageManager {
  getDirectory(): Promise<FileSystemDirectoryHandle>;
}

function supportsOriginPrivateFileSystem(
  storage: StorageManager,
): storage is StorageManagerWithDirectory {
  return typeof Reflect.get(storage, "getDirectory") === "function";
}

function writeUint32(bytes: Uint8Array, offset: number, value: number) {
  bytes[offset] = (value >>> 24) & 255;
  bytes[offset + 1] = (value >>> 16) & 255;
  bytes[offset + 2] = (value >>> 8) & 255;
  bytes[offset + 3] = value & 255;
}

function crc32(bytes: Uint8Array) {
  let crc = 4294967295;
  for (const byte of bytes) {
    crc = crcTable[(crc ^ byte) & 255] ^ (crc >>> 8);
  }
  return (crc ^ 4294967295) >>> 0;
}

function pngChunk(
  type: string,
  payload: Uint8Array<ArrayBufferLike> = new Uint8Array(),
) {
  const typeBytes = textEncoder.encode(type);
  const chunk = new Uint8Array(payload.byteLength + 12);
  writeUint32(chunk, 0, payload.byteLength);
  chunk.set(typeBytes, 4);
  chunk.set(payload, 8);
  writeUint32(
    chunk,
    payload.byteLength + 8,
    crc32(chunk.subarray(4, payload.byteLength + 8)),
  );
  return chunk;
}

function imageHeader(width: number, height: number) {
  const payload = new Uint8Array(13);
  writeUint32(payload, 0, width);
  writeUint32(payload, 4, height);
  payload[8] = 8;
  payload[9] = 6;
  return pngChunk("IHDR", payload);
}

function physicalPixelSize(dpi: number) {
  const pixelsPerMetre = Math.round(dpi / 0.0254);
  const payload = new Uint8Array(9);
  writeUint32(payload, 0, pixelsPerMetre);
  writeUint32(payload, 4, pixelsPerMetre);
  payload[8] = 1;
  return pngChunk("pHYs", payload);
}

async function createDestination(fileName: string): Promise<PngDestination> {
  if (navigator.storage && supportsOriginPrivateFileSystem(navigator.storage)) {
    const directory = await navigator.storage.getDirectory();
    const handle = await directory.getFileHandle(fileName, { create: true });
    const writable = await handle.createWritable();
    return {
      kind: "origin-private file stream",
      write: (bytes) => writable.write(Uint8Array.from(bytes)),
      close: () => writable.close(),
      getFile: () => handle.getFile(),
    };
  }

  const chunks: BlobPart[] = [];
  return {
    kind: "compressed-memory fallback",
    write(bytes) {
      chunks.push(Uint8Array.from(bytes));
    },
    close() {},
    getFile() {
      return new File(chunks, fileName, { type: "image/png" });
    },
  };
}

class StreamingPng {
  private readonly compression: CompressionStream;
  private readonly compressionWriter: WritableStreamDefaultWriter<BufferSource>;
  private readonly compressionReader: ReadableStreamDefaultReader<Uint8Array>;
  private pumpPromise: Promise<void> | undefined;

  constructor(
    private readonly width: number,
    private readonly height: number,
    private readonly destination: PngDestination,
    private readonly dpi = 300,
  ) {
    if (typeof CompressionStream !== "function") {
      throw new Error(
        "This browser does not support streaming DEFLATE compression.",
      );
    }
    this.compression = new CompressionStream("deflate");
    this.compressionWriter = this.compression.writable.getWriter();
    this.compressionReader = this.compression.readable.getReader();
  }

  async begin() {
    await this.destination.write(PNG_SIGNATURE);
    await this.destination.write(imageHeader(this.width, this.height));
    await this.destination.write(pngChunk("sRGB", Uint8Array.of(0)));
    await this.destination.write(physicalPixelSize(this.dpi));
    this.pumpPromise = this.pumpCompressedData();
  }

  private async pumpCompressedData() {
    for (;;) {
      const { done, value } = await this.compressionReader.read();
      if (done) break;
      if (value.byteLength > 0) {
        await this.destination.write(pngChunk("IDAT", value));
      }
    }
  }

  async writeRows(rgba: Uint8Array<ArrayBufferLike>, rowCount: number) {
    const rowBytes = this.width * 4;
    const filtered = new Uint8Array((rowBytes + 1) * rowCount);

    for (let row = 0; row < rowCount; row += 1) {
      const sourceOffset = row * rowBytes;
      const outputOffset = row * (rowBytes + 1);
      filtered[outputOffset] = 1;
      for (let byte = 0; byte < rowBytes; byte += 1) {
        const previous = byte >= 4 ? rgba[sourceOffset + byte - 4] : 0;
        filtered[outputOffset + byte + 1] =
          rgba[sourceOffset + byte] - previous;
      }
    }

    await this.compressionWriter.write(filtered);
  }

  async finish() {
    await this.compressionWriter.close();
    await this.pumpPromise;
    await this.destination.write(pngChunk("IEND"));
    await this.destination.close();
    return this.destination.getFile();
  }
}

async function verifyPng(file: File, width: number, height: number) {
  const header = new Uint8Array(await file.slice(0, 24).arrayBuffer());
  const hasSignature = PNG_SIGNATURE.every(
    (byte, index) => header[index] === byte,
  );
  const hasHeader = String.fromCharCode(...header.subarray(12, 16)) === "IHDR";
  if (!hasSignature || !hasHeader) {
    throw new Error("PNG verification found an invalid header.");
  }

  const view = new DataView(
    header.buffer,
    header.byteOffset,
    header.byteLength,
  );
  const actualWidth = view.getUint32(16);
  const actualHeight = view.getUint32(20);
  if (actualWidth !== width || actualHeight !== height) {
    throw new Error(
      `PNG verification returned ${actualWidth} × ${actualHeight}.`,
    );
  }
}

function download(file: File, fileName: string) {
  const href = URL.createObjectURL(file);
  const anchor = document.createElement("a");
  anchor.href = href;
  anchor.download = fileName;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(href), 30_000);
}

export interface ExportPngOptions {
  readonly size: number;
  readonly renderTile: (
    fullSize: number,
    x: number,
    y: number,
    width: number,
    height: number,
  ) => Promise<Uint8Array<ArrayBufferLike>>;
  readonly onProgress: (message: string) => void;
  readonly previewCanvas: HTMLCanvasElement;
  readonly previewPanel: HTMLElement;
}

export async function exportBlurStudyPng({
  size,
  renderTile,
  onProgress,
  previewCanvas,
  previewPanel,
}: ExportPngOptions) {
  const tileWidth = 1024;
  const stripeHeight = 256;
  const fileName = `box3d-capsules-${size}px-300dpi.png`;
  const destination = await createDestination(fileName);
  const png = new StreamingPng(size, size, destination, 300);
  const tileCount =
    Math.ceil(size / tileWidth) * Math.ceil(size / stripeHeight);
  let renderedTiles = 0;

  onProgress(
    `Preparing ${size.toLocaleString()} × ${size.toLocaleString()} PNG…`,
  );
  await png.begin();

  for (let y = 0; y < size; y += stripeHeight) {
    const height = Math.min(stripeHeight, size - y);
    const stripe = new Uint8Array(size * height * 4);

    for (let x = 0; x < size; x += tileWidth) {
      const width = Math.min(tileWidth, size - x);
      const tile = await renderTile(size, x, y, width, height);
      const tileRowBytes = width * 4;

      for (let row = 0; row < height; row += 1) {
        const sourceOffset = row * tileRowBytes;
        const outputOffset = row * size * 4 + x * 4;
        stripe.set(
          tile.subarray(sourceOffset, sourceOffset + tileRowBytes),
          outputOffset,
        );
      }

      renderedTiles += 1;
      onProgress(
        `Rendering ${Math.round((renderedTiles / tileCount) * 100)}% · ${destination.kind}`,
      );
      await new Promise<void>((resolve) =>
        requestAnimationFrame(() => resolve()),
      );
    }

    await png.writeRows(stripe, height);
  }

  onProgress("Finalising and verifying PNG…");
  const file = await png.finish();
  await verifyPng(file, size, size);

  if (size <= 4096) {
    const bitmap = await createImageBitmap(file);
    const context = previewCanvas.getContext("2d");
    if (!context) {
      bitmap.close();
      throw new Error("The PNG preview canvas has no 2D context.");
    }
    context.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
    context.drawImage(bitmap, 0, 0, previewCanvas.width, previewCanvas.height);
    previewPanel.hidden = false;
    bitmap.close();
  } else {
    previewPanel.hidden = true;
  }

  download(file, fileName);
  onProgress(
    `Verified ${size.toLocaleString()} × ${size.toLocaleString()} · ${(file.size / 1_048_576).toFixed(1)} MB`,
  );
}

// GLB helper for strip-model.sh.
//   node glb.mjs extract <in.glb> <dir>              write img<i>.<ext> per image
//   node glb.mjs build <in.glb> <emission.jpeg> <out.glb>
// build swaps image 3 (the sign emission) for the given JPEG, drops image 4
// (the sign normal map) with its texture and material slot, renames images,
// and repacks the binary chunk.
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const [cmd, input, a, b] = process.argv.slice(2);

function readGlb(path) {
  const buf = readFileSync(path);
  const jsonLength = buf.readUInt32LE(12);
  const json = JSON.parse(buf.subarray(20, 20 + jsonLength).toString("utf8"));
  const binStart = 20 + jsonLength + 8;
  const binLength = buf.readUInt32LE(20 + jsonLength);
  return { json, bin: buf.subarray(binStart, binStart + binLength) };
}

function viewBytes(json, bin, index) {
  const view = json.bufferViews[index];
  const offset = view.byteOffset ?? 0;
  return bin.subarray(offset, offset + view.byteLength);
}

const pad4 = (n) => (n + 3) & ~3;

function writeGlb(path, json, chunks) {
  // chunks[i] holds the bytes of bufferView i; rebuild offsets in order.
  let offset = 0;
  const parts = [];
  json.bufferViews.forEach((view, i) => {
    const bytes = chunks[i];
    view.byteOffset = offset;
    view.byteLength = bytes.length;
    parts.push(bytes);
    const padded = pad4(bytes.length);
    if (padded > bytes.length) parts.push(Buffer.alloc(padded - bytes.length));
    offset += padded;
  });
  json.buffers = [{ byteLength: offset }];
  const bin = Buffer.concat(parts);
  let jsonBytes = Buffer.from(JSON.stringify(json), "utf8");
  jsonBytes = Buffer.concat([
    jsonBytes,
    Buffer.alloc(pad4(jsonBytes.length) - jsonBytes.length, 0x20),
  ]);
  const header = Buffer.alloc(12);
  header.write("glTF", 0, "ascii");
  header.writeUInt32LE(2, 4);
  header.writeUInt32LE(12 + 8 + jsonBytes.length + 8 + bin.length, 8);
  const jsonHeader = Buffer.alloc(8);
  jsonHeader.writeUInt32LE(jsonBytes.length, 0);
  jsonHeader.write("JSON", 4, "ascii");
  const binHeader = Buffer.alloc(8);
  binHeader.writeUInt32LE(bin.length, 0);
  binHeader.write("BIN\0", 4, "ascii");
  writeFileSync(
    path,
    Buffer.concat([header, jsonHeader, jsonBytes, binHeader, bin]),
  );
}

const { json, bin } = readGlb(input);

if (cmd === "extract") {
  json.images.forEach((image, i) => {
    const ext = image.mimeType.split("/")[1];
    writeFileSync(
      join(a, `img${i}.${ext}`),
      viewBytes(json, bin, image.bufferView),
    );
  });
} else if (cmd === "build") {
  const chunks = json.bufferViews.map((_, i) => viewBytes(json, bin, i));
  const EMISSION = 3;
  const NORMAL = 4;
  chunks[json.images[EMISSION].bufferView] = readFileSync(a);

  // Drop the sign normal map: its image, its bufferView, its texture.
  const sign = json.materials.find((m) => m.name === "Cartel.001");
  const normalTexture = sign.normalTexture.index;
  if (json.textures[normalTexture].source !== NORMAL) {
    throw new Error("unexpected texture layout");
  }
  delete sign.normalTexture;
  const droppedView = json.images[NORMAL].bufferView;
  json.images.splice(NORMAL, 1);
  json.textures.splice(normalTexture, 1);
  for (const texture of json.textures) {
    if (texture.source > NORMAL) texture.source -= 1;
  }
  const remapTexture = (info) => {
    if (info && info.index > normalTexture) info.index -= 1;
  };
  for (const m of json.materials) {
    remapTexture(m.normalTexture);
    remapTexture(m.emissiveTexture);
    remapTexture(m.occlusionTexture);
    remapTexture(m.pbrMetallicRoughness?.baseColorTexture);
    remapTexture(m.pbrMetallicRoughness?.metallicRoughnessTexture);
  }
  json.bufferViews.splice(droppedView, 1);
  chunks.splice(droppedView, 1);
  const remapView = (i) => (i > droppedView ? i - 1 : i);
  for (const accessor of json.accessors) {
    accessor.bufferView = remapView(accessor.bufferView);
  }
  for (const image of json.images) image.bufferView = remapView(image.bufferView);

  const names = ["scene_normal", "scene_bake", "scene_roughness", "sign_emission"];
  json.images.forEach((image, i) => {
    image.name = names[i];
  });
  writeGlb(b, json, chunks);
} else {
  console.error("usage: glb.mjs extract|build ...");
  process.exit(1);
}

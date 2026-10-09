/**
 * Prints what is inside GLB files without a 3D library: node, mesh and
 * material names, whether materials use a texture or vertex colours, the
 * animation clip names, and the bounding box. Used once per pack before any
 * code depends on a name.
 *
 *   node scripts/inspect-glb.mjs public/models/cars
 *   node scripts/inspect-glb.mjs public/models/characters/character-male-a.glb
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, basename } from "node:path";

function parseGlb(buffer) {
  const magic = buffer.readUInt32LE(0);
  if (magic !== 0x46546c67) throw new Error("not a GLB");
  const chunkLength = buffer.readUInt32LE(12);
  const chunkType = buffer.readUInt32LE(16);
  if (chunkType !== 0x4e4f534a) throw new Error("first chunk is not JSON");
  return JSON.parse(buffer.subarray(20, 20 + chunkLength).toString("utf8"));
}

function bbox(json) {
  let min = [Infinity, Infinity, Infinity];
  let max = [-Infinity, -Infinity, -Infinity];
  for (const mesh of json.meshes ?? []) {
    for (const prim of mesh.primitives ?? []) {
      const acc = json.accessors?.[prim.attributes?.POSITION];
      if (!acc?.min || !acc?.max) continue;
      min = min.map((v, i) => Math.min(v, acc.min[i]));
      max = max.map((v, i) => Math.max(v, acc.max[i]));
    }
  }
  if (!Number.isFinite(min[0])) return null;
  const f = (n) => n.toFixed(2);
  return `size ${f(max[0] - min[0])} x ${f(max[1] - min[1])} x ${f(max[2] - min[2])}  (y ${f(min[1])}..${f(max[1])})`;
}

function describe(file) {
  const json = parseGlb(readFileSync(file));
  const nodes = (json.nodes ?? []).map((n) => n.name).filter(Boolean);
  const meshes = (json.meshes ?? []).map((m) => m.name).filter(Boolean);
  const materials = (json.materials ?? []).map((m) => {
    const pbr = m.pbrMetallicRoughness ?? {};
    const tex = pbr.baseColorTexture ? "tex" : "flat";
    const col = pbr.baseColorFactor ? `[${pbr.baseColorFactor.map((c) => c.toFixed(2)).join(",")}]` : "";
    return `${m.name ?? "?"}(${tex}${col})`;
  });
  const vertexColors = (json.meshes ?? []).some((m) => m.primitives?.some((p) => p.attributes?.COLOR_0 !== undefined));
  const anims = (json.animations ?? []).map((a) => a.name ?? "?");
  const skins = (json.skins ?? []).length;
  console.log(`\n${basename(file)}  ${(statSync(file).size / 1024).toFixed(0)} KB`);
  console.log(`  ${bbox(json)}`);
  console.log(`  nodes: ${nodes.slice(0, 24).join(", ")}${nodes.length > 24 ? ` ... (${nodes.length})` : ""}`);
  if (meshes.length) console.log(`  meshes: ${meshes.slice(0, 12).join(", ")}${meshes.length > 12 ? ` ... (${meshes.length})` : ""}`);
  console.log(`  materials: ${materials.join(", ")}${vertexColors ? "  +COLOR_0" : ""}`);
  if (skins) console.log(`  skins: ${skins}`);
  if (anims.length) console.log(`  animations: ${anims.join(", ")}`);
}

for (const arg of process.argv.slice(2)) {
  if (statSync(arg).isDirectory()) {
    for (const f of readdirSync(arg).filter((n) => n.endsWith(".glb")).sort()) describe(join(arg, f));
  } else {
    describe(arg);
  }
}

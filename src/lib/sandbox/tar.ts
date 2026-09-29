import "server-only";
import type { PlaygroundFile } from "@/components/playground/files";

// A minimal ustar writer: regular files only, enough to upload a playground with `tar -x`.

const BLOCK_SIZE = 512;

export function createTar(files: PlaygroundFile[]) {
  const mtime = Math.floor(Date.now() / 1000);
  const blocks: Buffer[] = [];
  for (const file of files) {
    const content = Buffer.from(file.content, "utf8");
    const padding = (BLOCK_SIZE - (content.length % BLOCK_SIZE)) % BLOCK_SIZE;
    blocks.push(header(file.path, content.length, mtime), content, Buffer.alloc(padding));
  }
  // The archive ends with two empty blocks.
  blocks.push(Buffer.alloc(BLOCK_SIZE * 2));
  return Buffer.concat(blocks);
}

function header(path: string, size: number, mtime: number) {
  const [prefix, name] = splitPath(path);
  const block = Buffer.alloc(BLOCK_SIZE);
  block.write(name, 0, 100);
  block.write(octal(0o644, 8), 100);
  block.write(octal(0, 8), 108); // uid
  block.write(octal(0, 8), 116); // gid
  block.write(octal(size, 12), 124);
  block.write(octal(mtime, 12), 136);
  block.write(" ".repeat(8), 148); // checksum, counted as spaces
  block.write("0", 156); // regular file
  block.write("ustar\u000000", 257);
  block.write(prefix, 345, 155);

  let checksum = 0;
  for (const byte of block) checksum += byte;
  block.write(`${checksum.toString(8).padStart(6, "0")}\u0000 `, 148);
  return block;
}

// Zero-padded octal, NUL-terminated.
function octal(value: number, length: number) {
  return `${value.toString(8).padStart(length - 1, "0")}\u0000`;
}

// ustar fits 100 bytes of name, plus up to 155 bytes of directories in a separate prefix.
function splitPath(path: string): [prefix: string, name: string] {
  if (Buffer.byteLength(path) <= 100) return ["", path];
  for (let slash = path.indexOf("/"); slash !== -1; slash = path.indexOf("/", slash + 1)) {
    const prefix = path.slice(0, slash);
    const name = path.slice(slash + 1);
    if (Buffer.byteLength(name) <= 100 && Buffer.byteLength(prefix) <= 155) return [prefix, name];
  }
  throw new Error(`File path is too long: ${path}`);
}

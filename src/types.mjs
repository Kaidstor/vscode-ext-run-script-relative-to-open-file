/**
 *  Создание файла index.ts
 */
import { readdirSync, statSync, writeFileSync, promises as fs } from "fs";
import { join, resolve, relative } from "path";

function getAllFiles(dir, { endsWith, skipBaseDirIndex = false }) {
  let results = [];
  const list = readdirSync(dir);

  // Проверка на наличие index.ts в текущей директории
  const hasIndexFile = list.some((file) => file === "index.ts");

  if (hasIndexFile && !skipBaseDirIndex && dir !== "./") {
    results.push(join(dir, "index.ts"));
    return results; // Прерываем дальнейшую обработку текущей директории
  }

  list.forEach((file) => {
    file = join(dir, file);
    const stat = statSync(file);
    if (stat && stat.isDirectory() && !file.includes("node_modules")) {
      results = results.concat(getAllFiles(file, { endsWith }));
    } else if ((!hasIndexFile || skipBaseDirIndex) && file.endsWith(endsWith)) {
      // Добавляем файл, если в папке нет index.ts
      if (!file.endsWith("/index.ts")) {results.push(file);}
    }
  });
  return results;
}

const rel = (file, workingDir) => {
  return "./" + relative(resolve(workingDir), file).replace(/\\/g, "/");
};

const exportStatement = (paths, workingDir) => {
  return paths
    .map((p) => `export * from '${rel(p, workingDir).slice(0, -3)}';`)
    .join("\n");
};

const genIndexForDir = async (dir) => {
  const output = resolve(`${dir}/index.ts`);
  const files = getAllFiles(dir, { endsWith: ".ts", skipBaseDirIndex: true });
  const types = exportStatement(files, dir);

  if (types.trim() === "") {
    await fs.rm(output).catch(() => {});
  } else {
    writeFileSync(output, types + "\n");
  }
};

// Получаем путь из аргументов командной строки или используем текущую директорию
let dir = process.argv[2] || "./";
if (dir.endsWith("/index.ts")) {dir = dir.slice(0, -9);}

await genIndexForDir(dir);

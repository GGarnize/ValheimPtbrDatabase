import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ITEM_LIST_URL = "https://valheim-modding.github.io/Jotunn/data/objects/item-list.html";
const PT_BR_URL = "https://valheim-modding.github.io/Jotunn/data/localization/translations/Portuguese_Brazilian.html";

const decodeHtml = (value) => value
  .replace(/<br\s*\/?>/gi, " ")
  .replace(/<img\b[^>]*>/gi, "")
  .replace(/<[^>]+>/g, "")
  .replace(/&nbsp;/gi, " ")
  .replace(/&amp;/gi, "&")
  .replace(/&quot;/gi, '"')
  .replace(/&#39;|&apos;/gi, "'")
  .replace(/&lt;/gi, "<")
  .replace(/&gt;/gi, ">")
  .replace(/&#(\d+);/g, (_, number) => String.fromCodePoint(Number(number)))
  .replace(/&#x([\da-f]+);/gi, (_, number) => String.fromCodePoint(Number.parseInt(number, 16)))
  .replace(/\s+/g, " ")
  .trim();

const rawTableRows = (html) => [...html.matchAll(/<tr>([\s\S]*?)<\/tr>/gi)]
  .map(([, row]) => [...row.matchAll(/<td>([\s\S]*?)<\/td>/gi)].map(([, cell]) => cell))
  .filter((cells) => cells.length > 0);

const tableRows = (html) => rawTableRows(html).map((cells) => cells.map(decodeHtml));

const getText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Falha ao baixar ${url}: ${response.status}`);
  return response.text();
};

const [itemsHtml, ptBrHtml] = await Promise.all([getText(ITEM_LIST_URL), getText(PT_BR_URL)]);
const translations = new Map(
  tableRows(ptBrHtml)
    .filter((cells) => cells.length === 2)
    .map(([token, text]) => [token, text]),
);

const items = rawTableRows(itemsHtml)
  .filter((cells) => cells.length === 6)
  .map(([prefabCell, , tokenCell, englishNameCell, typeCell]) => {
    const prefab = decodeHtml(prefabCell);
    const token = decodeHtml(tokenCell);
    const englishName = decodeHtml(englishNameCell);
    const iconPath = prefabCell.match(/<img\b[^>]*\bsrc=["']([^"']+)["']/i)?.[1] ?? "";
    return {
      ptBrName: translations.get(token) || (englishName === "NULL" ? prefab : englishName),
      englishName,
      prefab,
      token,
      type: decodeHtml(typeCell),
      iconUrl: iconPath ? new URL(iconPath, ITEM_LIST_URL).href : "",
      localized: translations.has(token),
    };
  })
  .sort((a, b) => a.ptBrName.localeCompare(b.ptBrName, "pt-BR", { sensitivity: "base" }));

const version = itemsHtml.match(/generated from Valheim ([^<\s]+)/i)?.[1] ?? "desconhecida";
const scriptDir = dirname(fileURLToPath(import.meta.url));
const output = resolve(scriptDir, "../dist/items.json");

try {
  const current = JSON.parse(await readFile(output, "utf8"));
  const sameVersion = current.meta?.valheimVersion === version;
  const sameItems = JSON.stringify(current.items) === JSON.stringify(items);

  if (sameVersion && sameItems) {
    console.log(`A base já está atualizada: ${items.length} itens do Valheim ${version}.`);
    process.exit(0);
  }
} catch (error) {
  if (error.code !== "ENOENT") {
    console.warn("A base atual não pôde ser comparada e será reconstruída.");
  }
}

const payload = {
  meta: {
    generatedAt: new Date().toISOString(),
    valheimVersion: version,
    itemSource: ITEM_LIST_URL,
    localizationSource: PT_BR_URL,
    total: items.length,
    localized: items.filter((item) => item.localized).length,
  },
  items,
};

await mkdir(dirname(output), { recursive: true });
await writeFile(output, JSON.stringify(payload));
console.log(`Gerados ${items.length} itens (${payload.meta.localized} localizados) para Valheim ${version}.`);

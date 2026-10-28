import { z } from "zod";

const MAX_RESULTS = 8;

const searchArgsSchema = z.object({
  query: z.string().min(1).max(200),
  limit: z.coerce.number().int().min(1).max(MAX_RESULTS).optional(),
});

type DemoProduct = {
  id: string;
  name: string;
  price: string;
  stock_status: "instock" | "outofstock" | "onbackorder";
  categories: string[];
  keywords: string;
};

type DemoSearchResult = Omit<DemoProduct, "keywords"> & {
  currency: string;
  score: number;
};

export const DEMO_CATALOG_PROMPT =
  "The product catalog is a demo store with fictional coffee products and services, so visitors can see how product search works. Use search_products when the visitor asks about products or services, and make clear they are examples that cannot be purchased.";

const DEMO_CURRENCY = "EUR";

const DEMO_PRODUCTS: DemoProduct[] = [
  { id: "demo-cafe-etiopia", name: "Café en grano Etiopía 250 g", price: "12.90", stock_status: "instock", categories: ["Café en grano"], keywords: "cafe coffee grano beans etiopia tueste claro afrutado" },
  { id: "demo-cafe-colombia", name: "Café molido Colombia 250 g", price: "10.50", stock_status: "instock", categories: ["Café molido"], keywords: "cafe coffee molido ground colombia tueste medio chocolate" },
  { id: "demo-cafe-descafeinado", name: "Café descafeinado Brasil 250 g", price: "11.20", stock_status: "outofstock", categories: ["Café en grano"], keywords: "cafe coffee descafeinado decaf grano beans brasil" },
  { id: "demo-cafetera-goteo", name: "Cafetera de goteo de cerámica", price: "24.00", stock_status: "instock", categories: ["Accesorios"], keywords: "cafetera goteo filtro dripper pour over ceramica coffee maker" },
  { id: "demo-prensa-francesa", name: "Prensa francesa 1 l", price: "29.50", stock_status: "onbackorder", categories: ["Accesorios"], keywords: "prensa francesa french press cafetera embolo" },
  { id: "demo-molinillo", name: "Molinillo manual de muelas cónicas", price: "39.90", stock_status: "instock", categories: ["Accesorios"], keywords: "molinillo molino grinder manual muelas" },
  { id: "demo-filtros", name: "Filtros de papel (100 unidades)", price: "5.90", stock_status: "instock", categories: ["Accesorios"], keywords: "filtros papel paper filters goteo" },
  { id: "demo-tazas", name: "Juego de 2 tazas de cerámica", price: "18.00", stock_status: "instock", categories: ["Menaje"], keywords: "taza tazas mug mugs cups ceramica" },
  { id: "demo-kit-regalo", name: "Kit regalo: café + taza", price: "27.90", stock_status: "instock", categories: ["Regalos"], keywords: "kit regalo gift pack caja cafe taza" },
  { id: "demo-suscripcion", name: "Suscripción mensual de café", price: "19.90", stock_status: "instock", categories: ["Servicios"], keywords: "suscripcion mensual subscription monthly envio cada mes servicio service" },
  { id: "demo-taller-barista", name: "Taller de barista para principiantes (2 h)", price: "45.00", stock_status: "instock", categories: ["Servicios"], keywords: "taller curso clase barista workshop course class latte servicio service" },
  { id: "demo-cata", name: "Cata guiada de cafés de origen", price: "30.00", stock_status: "instock", categories: ["Servicios"], keywords: "cata degustacion tasting origen servicio service" },
];

// Stop words and words that ask for the whole catalog rather than a specific item.
const IGNORED_TERMS = new Set([
  "con", "para", "por", "una", "uno", "los", "las", "del", "que", "the", "and", "for", "with",
  "producto", "productos", "catalogo", "tienda", "todo", "todos", "tienes", "teneis", "vendes", "vendeis",
  "product", "products", "catalog", "store", "shop", "all", "sell",
]);

function normalizeText(value: string) {
  return value.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function tokenize(value: string) {
  return normalizeText(value).split(/[^a-z0-9]+/).filter((token) => token.length > 2);
}

// Stemmed on both sides so singular and plural match ("tazas" ~ "taza", "cafés" ~ "café").
function tokenStems(token: string) {
  const stems = [token];
  if (token.endsWith("es") && token.length > 4) stems.push(token.slice(0, -2));
  if (token.endsWith("s") && token.length > 3) stems.push(token.slice(0, -1));
  return stems;
}

const PRODUCT_STEMS = DEMO_PRODUCTS.map(
  (product) => new Set(tokenize([product.name, ...product.categories, product.keywords].join(" ")).flatMap(tokenStems))
);

export function demoSearchProducts(args: unknown): DemoSearchResult[] {
  const parsed = searchArgsSchema.safeParse(args);
  if (!parsed.success) {
    throw new Error("Invalid search arguments.");
  }

  const maxResults = parsed.data.limit ?? MAX_RESULTS;
  const terms = tokenize(parsed.data.query).filter((token) => !IGNORED_TERMS.has(token));

  const scores = DEMO_PRODUCTS.map(() => 0);
  for (const term of terms) {
    const stems = tokenStems(term);
    const matching = PRODUCT_STEMS.flatMap((words, index) => (stems.some((stem) => words.has(stem)) ? [index] : []));
    // Rarer terms weigh more, so "coffee grinder" ranks the grinder above every coffee.
    for (const index of matching) scores[index] += 1 / matching.length;
  }

  const scored = DEMO_PRODUCTS.map((product, index) => ({ product, score: scores[index] }));
  const matches = terms.length ? scored.filter((entry) => entry.score > 0) : scored;

  return matches
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(({ product, score }) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: DEMO_CURRENCY,
      stock_status: product.stock_status,
      categories: product.categories,
      score,
    }));
}

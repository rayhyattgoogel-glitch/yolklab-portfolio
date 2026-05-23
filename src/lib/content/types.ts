export type ProductType = "tool" | "game";
export type ProductStatus = "live" | "beta" | "archived" | "planned";

export type EntryKind =
  | "web"
  | "appstore"
  | "googleplay"
  | "download"
  | "wechat"
  | "source"
  | "mini-app";

export interface ProductEntry {
  kind: EntryKind;
  label: string;
  url?: string;
  qr?: string;
  appid?: string;
}

export interface Product {
  slug: string;
  title: string;
  type: ProductType;
  status: ProductStatus;
  year: number;
  launchedAt?: string;
  oneLiner: string;
  tags: string[];
  cover?: string;
  ogImage?: string;
  entries: ProductEntry[];
  related: string[];
  body: string;
  filePath: string;
}

export type ReleaseKind = "major" | "feature" | "fix" | "release";

export type ReleaseSource = "manual" | "github";

export interface Release {
  product: string;
  date: string;
  version: string;
  kind: ReleaseKind;
  title: string;
  body: string;
  filePath: string;
  /** When true, sync-releases will NOT overwrite this file. */
  manual?: boolean;
  /** Where the release record originated. Defaults to "manual" when absent. */
  source?: ReleaseSource;
  /** Direct link to the GitHub release page (only for source: github). */
  githubUrl?: string;
}

export interface Diary {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  cover?: string;
  /** When true, the entry is excluded from build output. */
  draft?: boolean;
  body: string;
  filePath: string;
}

export interface DiaryIndex {
  slug: string;
  title: string;
  date: string;
  summary: string;
  tags: string[];
  cover?: string;
}

export interface ProductIndex {
  slug: string;
  title: string;
  type: ProductType;
  status: ProductStatus;
  year: number;
  launchedAt?: string;
  oneLiner: string;
  tags: string[];
  cover?: string;
  entryCount: number;
  hasQr: boolean;
  releaseCount: number;
  latestRelease?: string;
}

export interface ReleaseIndex {
  product: string;
  productTitle: string;
  productType: ProductType;
  date: string;
  version: string;
  kind: ReleaseKind;
  title: string;
}

export interface SiteIndex {
  generatedAt: string;
  products: ProductIndex[];
  releases: ReleaseIndex[];
  diaries: DiaryIndex[];
  counts: {
    tools: number;
    games: number;
    total: number;
    releases: number;
    diaries: number;
  };
}

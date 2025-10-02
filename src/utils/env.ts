// 環境変数とベースパスの設定
export const BASE_PATH = import.meta.env.BASE_URL || '/';
export const IS_GITHUB_PAGES = BASE_PATH.includes('/block_rpg/');

// 静的ファイルのパスを生成するヘルパー関数
export const getAssetPath = (path: string): string => {
  // パスが既にフルURLの場合はそのまま返す
  if (path.startsWith('http') || path.startsWith('//')) {
    return path;
  }
  
  // パスが既にベースパスで始まっている場合はそのまま返す
  if (path.startsWith(BASE_PATH)) {
    return path;
  }
  
  // パスが/で始まる場合は、ベースパスと結合
  if (path.startsWith('/')) {
    return BASE_PATH + path.slice(1);
  }
  
  // 相対パスの場合は、ベースパスと結合
  return BASE_PATH + path;
};

// ルーティング用のパスを生成するヘルパー関数
export const getRoutePath = (path: string): string => {
  if (path.startsWith('/')) {
    return BASE_PATH + path.slice(1);
  }
  return BASE_PATH + path;
};

// デバッグ情報を出力
if (import.meta.env.DEV) {
  console.log('Environment Info:', {
    BASE_PATH,
    IS_GITHUB_PAGES,
    BASE_URL: import.meta.env.BASE_URL,
    VITE_BASE_PATH: import.meta.env.VITE_BASE_PATH,
  });
}
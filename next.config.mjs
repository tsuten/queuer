/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export',  // 静的エクスポートを有効化
  assetPrefix: './',  // 相対パスを使用（Electron用）
  images: {
    unoptimized: true,  // 静的エクスポート時は画像最適化を無効化
  },
};

export default nextConfig;

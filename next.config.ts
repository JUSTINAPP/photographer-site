import type { NextConfig } from 'next';
const config: NextConfig = {poweredByHeader:false,
 experimental: { staleTimes: { dynamic: 30, static: 180 } },
 images: { deviceSizes: [480,640,960,1280,1600,1920], imageSizes: [160,320], minimumCacheTTL: 604800, formats: ['image/webp'] }, async headers(){return [{source:'/(.*)',headers:[{key:'X-Content-Type-Options',value:'nosniff'},{key:'Referrer-Policy',value:'strict-origin-when-cross-origin'},{key:'X-Frame-Options',value:'DENY'}]}]}};
export default config;

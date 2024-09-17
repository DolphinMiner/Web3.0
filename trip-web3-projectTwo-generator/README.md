## 功能点整理

+ 样式库存可自由调节
+ 样式之间存在限制关系:互斥或依赖
+ 随机拼接
+ 有暂存区,用于支持保存用户手动拼接的结果
+ 需要持久化存储

## TODO

+ [ ] 导出元数据
+ [x] BatchPanel.draftEntities锁定时校验dna是否重合存在
+ [x] BatchPanel手动设置一批数量，目前写死10个一批
+ [x] Shuffle设置loading
+ [x] 单独/批量锁定，目前只有全部批量锁定
+ [ ] 导入/导出配置，用于分享

## 说明

1. 上传Zip包需要以图层Layer的名字命名,如图层为'Background',则上传文件名为'Background.zip'
2. 上传Zip包内部只包含样式图片,不要有内嵌文件夹层级存在.打包资源可通过`zip -r Background.zip ./*.png`实现
3. 请仔细编辑详细样式库存及约束关系,这将直接决定图片生成是否成功

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

[API routes](https://nextjs.org/docs/api-routes/introduction) can be accessed on [http://localhost:3000/api/hello](http://localhost:3000/api/hello). This endpoint can be edited in `pages/api/hello.ts`.

The `pages/api` directory is mapped to `/api/*`. Files in this directory are treated as [API routes](https://nextjs.org/docs/api-routes/introduction) instead of React pages.

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.

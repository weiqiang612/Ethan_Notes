import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

// 自动化侧边栏生成函数
function getSidebar() {
  // 这里的路径是指向你的 docs 目录
  const docsPath = path.resolve(__dirname, '../')
  // 排除掉 VitePress 的系统文件夹和首页
  const ignoreFiles = ['.vitepress', 'public', 'index.md', 'api-examples.md', 'markdown-examples.md', 'node_modules']
  
  const sidebar: any[] = []
  const files = fs.readdirSync(docsPath)

  files.forEach(file => {
    const filePath = path.join(docsPath, file)
    if (fs.statSync(filePath).isDirectory() && !ignoreFiles.includes(file)) {
      // 读取文件夹下的 md 文件
      const children = fs.readdirSync(filePath)
        .filter(f => f.endsWith('.md'))
        .map(f => ({
          text: f.replace('.md', ''),
          link: `/${file}/${f.replace('.md', '')}`
        }))

      if (children.length > 0) {
        sidebar.push({
          text: file, // 文件夹名字作为分组标题
          collapsed: false, // 默认展开
          items: children
        })
      }
    }
  })
  return sidebar
}

export default defineConfig({
  title: "Ethan's Notes",
  description: "Java 后端开发笔记门户",
  themeConfig: {
    nav: [
      { text: '首页', link: '/' },
      { text: '笔记入门', link: '/Redis/index' } // 这里可以写一个你具体的 md 链接
    ],

    // 关键点：调用自动化脚本
    sidebar: getSidebar(),

    socialLinks: [
      { icon: 'github', link: 'https://github.com/weiqiang612/My-TuChuang' }
    ]
  }
})
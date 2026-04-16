import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

function getSidebar() {
  const docsPath = path.resolve(__dirname, '../')
  const ignoreFiles = ['.vitepress', 'public', 'index.md', 'api-examples.md', 'markdown-examples.md', 'node_modules']
  
  const sidebar: any[] = []
  const files = fs.readdirSync(docsPath)
  files.forEach(file => {
    const filePath = path.join(docsPath, file)
    if (fs.statSync(filePath).isDirectory() && !ignoreFiles.includes(file)) {
      const children = fs.readdirSync(filePath)
        .filter(f => f.endsWith('.md') && f !== 'index.md') // ① 过滤掉 index.md
        .map(f => ({
          text: f.replace('.md', ''),
          link: `/${file}/${f.replace('.md', '')}`
        }))
      if (children.length > 0) {
        sidebar.push({
          text: file,
          link: `/${file}/`,
          collapsed: false,
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
      { text: '笔记入门', link: '/Redis/' } // ② 改为指向索引页
    ],
    sidebar: getSidebar(),
    socialLinks: [
      { icon: 'github', link: 'https://github.com/weiqiang612/My-TuChuang' }
    ]
  },
    vue: {
    template: {
      compilerOptions: {
        isCustomElement: (tag) => {
          // 只放行这些在文档正文里出现过的裸标签
          const customTags = [
            'foreach', 'if', 'where', 'set', 'trim',  // MyBatis XML 标签
            'select', 'insert', 'update', 'delete',     // MyBatis SQL 标签
            'configuration', 'mapper', 'resultMap',     // MyBatis 配置标签
            'dependency', 'groupId', 'artifactId',      // Maven 标签
            'beans', 'bean', 'property',                // Spring XML 标签
          ]
          return customTags.includes(tag)
        }
      }
    }
  }
})
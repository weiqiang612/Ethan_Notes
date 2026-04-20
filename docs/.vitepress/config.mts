import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

function getSidebar() {
  const docsPath = path.resolve(__dirname, '../')
  const ignoreFiles = ['.vitepress', 'public', 'index.md', 'api-examples.md', 'markdown-examples.md', 'node_modules']
  
  // 1. 定义自然排序函数
  const naturalSort = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  }

  const sidebar: any[] = []
  const files = fs.readdirSync(docsPath)

  // 文件夹也排一下序
  files.sort(naturalSort).forEach(file => {
    const filePath = path.join(docsPath, file)
    if (fs.statSync(filePath).isDirectory() && !ignoreFiles.includes(file)) {
      
      // 2. 获取子文件并应用自然排序
      const childrenFiles = fs.readdirSync(filePath)
        .filter(f => f.endswith('.md') && f.toLowerCase() !== 'index.md')
      
      // 执行排序：确保 2. 在 10. 前面
      childrenFiles.sort(naturalSort)

      const children = childrenFiles.map(f => ({
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
      { icon: 'github', link: 'https://github.com/weiqiang612' }
    ],
    outline: {
      level: [2, 4],  // 覆盖 ## ### #### 三个层级
      label: '本页目录'
    }
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
  },
  ignoreDeadLinks: [
    /^https?:\/\/localhost/,  // 忽略所有 localhost 链接
  ]
})
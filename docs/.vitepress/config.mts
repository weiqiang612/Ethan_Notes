import { defineConfig } from 'vitepress'
import fs from 'fs'
import path from 'path'

function getSidebar() {
  const docsPath = path.resolve(__dirname, '../')
  const ignoreFolders = ['.vitepress', 'public', 'node_modules', '.git', '.idea', '.obsidian', '.tmp.driveupload', 'assets']
  const ignoreFiles = ['index.md', 'api-examples.md', 'markdown-examples.md']
  
  // 1. 定义自然排序函数
  const naturalSort = (a: string, b: string) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' })
  }

  function scanDir(dirPath: string, relativePath: string = ''): any[] {
    const items: any[] = []
    if (!fs.existsSync(dirPath)) return items

    const files = fs.readdirSync(dirPath)
    files.sort(naturalSort)

    for (const file of files) {
      const fullPath = path.join(dirPath, file)
      const isDir = fs.statSync(fullPath).isDirectory()
      const currentRelative = relativePath ? `${relativePath}/${file}` : file
      const webRelativePath = currentRelative.replace(/\\/g, '/')

      if (isDir) {
        if (ignoreFolders.includes(file) || file.startsWith('.')) {
          continue
        }
        const childItems = scanDir(fullPath, currentRelative)
        if (childItems.length > 0) {
          items.push({
            text: file,
            collapsed: relativePath === '' ? false : true, // 一级目录展开，二级及以下目录折叠
            items: childItems,
            link: `/${webRelativePath}/`
          })
        }
      } else {
        if (file.endsWith('.md') && !ignoreFiles.includes(file.toLowerCase()) && !file.startsWith('.')) {
          const nameWithoutExt = file.replace(/\.md$/i, '')
          items.push({
            text: nameWithoutExt,
            link: `/${webRelativePath.replace(/\.md$/i, '')}`
          })
        }
      }
    }
    return items
  }

  return scanDir(docsPath)
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
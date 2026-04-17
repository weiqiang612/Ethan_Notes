import os
import re
from urllib.parse import quote


def get_display_title(file_path, filename):
    # 优先获取 Markdown 中的第一个一级标题
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('# '):
                    return line.replace('# ', '').strip()
    except Exception:
        pass

    # 没找到标题则回退到文件名（去除数字前缀和扩展名）
    base_name = os.path.splitext(filename)[0]
    return re.sub(r'^\d+\.\s*', '', base_name)


def generate_indexes(docs_path):
    for root, dirs, files in os.walk(docs_path):
        # 忽略 VitePress 内部目录和静态资源目录
        if '.vitepress' in root or 'public' in root:
            continue

        # 筛选 .md 文件并排除已有的 index.md
        md_files = [f for f in files if f.endswith('.md') and f.lower() != 'index.md']

        # 只有当目录下有 .md 文件时才生成索引
        if not md_files:
            continue

        # 排序：1.xxx 2.xxx 确保顺序正确
        md_files.sort()

        folder_name = os.path.basename(root)
        index_content = f"# {folder_name}\n\n## 📑 本节目录\n\n"

        for f in md_files:
            file_path = os.path.join(root, f)
            display_title = get_display_title(file_path, f)
            # URL 编码处理空格等特殊字符
            url_encoded_filename = quote(f)
            index_content += f"- [{display_title}](./{url_encoded_filename})\n"

        # 写入 index.md
        with open(os.path.join(root, 'index.md'), 'w', encoding='utf-8') as f:
            f.write(index_content)
        print(f"已生成: {os.path.join(root, 'index.md')}")


if __name__ == "__main__":
    # 指向 docs 目录
    target_docs = os.path.join(os.getcwd(), 'docs')
    generate_indexes(target_docs)
import os
import re
from urllib.parse import quote

def natural_sort_key(s):
    return [int(text) if text.isdigit() else text.lower()
            for text in re.split(r'(\d+)', s)]

def get_display_title(file_path, filename):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            for line in f:
                if line.startswith('# '):
                    return line.replace('# ', '').strip()
    except Exception:
        pass
    base_name = os.path.splitext(filename)[0]
    return re.sub(r'^\d+\.\s*', '', base_name)

def generate_indexes(docs_path):
    for root, dirs, files in os.walk(docs_path):
        if '.vitepress' in root or 'public' in root:
            continue
        if os.path.abspath(root) == os.path.abspath(docs_path):
            continue

        md_files = [f for f in files if f.endswith('.md') and f.lower() != 'index.md']
        if not md_files:
            continue

        md_files.sort(key=natural_sort_key)
        
        # --- 核心修改：尝试提取原有简介 ---
        target_index_path = os.path.join(root, 'index.md')
        prefix_content = ""
        
        if os.path.exists(target_index_path):
            with open(target_index_path, 'r', encoding='utf-8') as f:
                original_content = f.read()
                
                # 1. 查找“## ...本节目录”出现的位置
                match = re.search(r'## .*?本节目录', original_content)
                
                if match:
                    # 2. 核心改变：只保留目录标题之前的内容
                    # 彻底丢弃 match.start() 之后的所有旧链接
                    prefix_content = original_content[:match.start()].rstrip() + "\n\n"
                else:
                    # 如果没找到目录标识，说明是纯净的简介页
                    # 检查是否有 # 标题，没有就补一个
                    if not original_content.startswith('# '):
                        folder_name = os.path.basename(root)
                        prefix_content = f"# {folder_name}\n\n" + original_content.rstrip() + "\n\n"
                    else:
                        prefix_content = original_content.rstrip() + "\n\n"
        
        # 如果是新文件或没找到原内容，使用默认标题
        if not prefix_content.strip():
            folder_name = os.path.basename(root)
            prefix_content = f"# {folder_name}\n\n"

        # 3. 重新生成完整的 index.md
        # 强制使用带图标的标题，方便下次正则匹配
        index_content = prefix_content + "## 📑 本节目录\n\n"
        for f in md_files:
            file_path = os.path.join(root, f)
            display_title = get_display_title(file_path, f)
            url_encoded_filename = quote(f)
            index_content += f"- [{display_title}](./{url_encoded_filename})\n"

        # 4. 写入（'w' 模式覆盖写入）
        with open(target_index_path, 'w', encoding='utf-8') as f:
            f.write(index_content)
        print(f"已处理: {target_index_path}")

if __name__ == "__main__":
    target_docs = os.path.join(os.getcwd(), 'docs')
    generate_indexes(target_docs)
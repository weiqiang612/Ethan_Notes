$configPath = "C:\Users\Ethan\.gemini\config\mcp_config.json";

# 读取并解析现有配置
$raw = Get-Content $configPath -Raw;
$jsonContent = ConvertFrom-Json $raw;

# 构造具有极致兼容性的哈希表结构（使用分号显式断句）
$obsidianHash = @{
    command = "npx";
    args = @("-y", "obsidian-mcp-server", "c:/Users/Ethan/Desktop/笔记");
    env = @{
        OBSIDIAN_API_KEY = "54fb3e6491590cd3e64c769e696116db684c038aad3691c87ccbdb9919f17c9c";
        OBSIDIAN_PORT = "27124";
        NODE_TLS_REJECT_UNAUTHORIZED = "0";
    };
    disabled = $false;
}

# 强转为对象
$obsidianConfig = [PSCustomObject]$obsidianHash;

# 合并配置
$jsonContent.mcpServers | Add-Member -MemberType NoteProperty -Name "obsidian" -Value $obsidianConfig -Force;

# 序列化为 JSON 字符串
$newJson = ConvertTo-Json $jsonContent -Depth 10;

# 使用 UTF8 且无 BOM 格式强制写回文件
[IO.File]::WriteAllText($configPath, $newJson);

Write-Output "Successfully updated mcp_config.json with Obsidian MCP!";

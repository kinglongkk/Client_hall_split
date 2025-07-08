#!/bin/bash

# 批量修复 SetNodeImageByFilePath 函数中的 _renderFlag 错误
# 这个脚本会在所有包含 SetNodeImageByFilePath 的 JavaScript 文件中添加对象有效性检查

echo "开始批量修复 _renderFlag 错误..."

# 查找所有包含 SetNodeImageByFilePath 的 JavaScript 文件
files=$(find ~/HallAndSubGame/Client_hall_split/assets/script -name "*.js" -exec grep -l "SetNodeImageByFilePath" {} \;)

# 计数器
count=0
fixed=0

for file in $files; do
    count=$((count + 1))
    echo "处理文件 $count: $file"
    
    # 检查文件是否包含需要修复的模式
    if grep -q "nodeSprite.spriteFrame = spriteFrame;" "$file"; then
        # 创建备份
        cp "$file" "$file.backup"
        
        # 使用 sed 进行替换
        # 注意：这个替换可能需要根据具体的代码格式进行调整
        sed -i '' 's/nodeSprite\.spriteFrame = spriteFrame;/\/\/ 检查对象是否仍然有效，防止_renderFlag错误\
                if(!nodeSprite || !nodeSprite.isValid || !node || !node.isValid){\
                    that.ErrLog("SetNodeImageByFilePath nodeSprite or node is invalid or destroyed");\
                    return false;\
                }\
                nodeSprite.spriteFrame = spriteFrame;/g' "$file"
        
        if [ $? -eq 0 ]; then
            fixed=$((fixed + 1))
            echo "  ✓ 修复成功"
        else
            echo "  ✗ 修复失败，恢复备份"
            mv "$file.backup" "$file"
        fi
    else
        echo "  - 跳过（未找到需要修复的代码）"
    fi
done

echo ""
echo "修复完成！"
echo "总共检查了 $count 个文件"
echo "成功修复了 $fixed 个文件"
echo ""
echo "备份文件以 .backup 结尾，如果修复有问题可以恢复"

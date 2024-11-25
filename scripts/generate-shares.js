const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { createCanvas, registerFont } = require('canvas');
const glob = require('glob');

// 基本設定
const config = {
    outputDir: 'assets/img/shares',
    postsDir: '_posts',
    width: 1200,
    height: 630
};

// 字型設定
const FONT_CONFIG = {
    zh: {
        regular: {
            path: '/usr/share/fonts/noto-cjk/NotoSansCJK-Regular.ttc',
            family: 'Noto Sans CJK'
        },
        bold: {
            path: '/usr/share/fonts/noto-cjk/NotoSansCJK-Bold.ttc',
            family: 'Noto Sans CJK Bold'
        }
    },
    en: {
        regular: {
            family: 'Arial'
        },
        bold: {
            family: 'Arial Bold'
        }
    }
};

// 樣式設定
const style = {
    title: {
        size: 80,          // 適中的標題大小
        lineHeight: 100,   // 適當的行距
        marginBottom: 30,
        maxLines: 3        // 最多顯示三行標題
    },
    description: {
        size: 48,
        lineHeight: 60,
        marginBottom: 40,
        maxLines: 2,
        charLimit: {       // 描述文字字數限制
            zh: 50,        // 中文 50 字
            en: 100        // 英文 100 字
        }
    },
    siteName: {
        size: 40,
        marginBottom: 30
    }
};

// 讀取 _config.yml 以得到 site.title
function getSiteNameFromConfig() {
    try {
        const configPath = path.join(process.cwd(), '_config.yml');
        const fileContents = fs.readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents);
        return config.title || 'My Blog';
    } catch (error) {
        console.warn('無法讀取網站名稱，使用預設值');
        return 'My Blog';
    }
}


// 設定字型
function setupFonts(lang) {
    if (lang === 'zh') {
        if (!fs.existsSync(FONT_CONFIG.zh.regular.path)) {
            console.error('找不到中文字型，請安裝 noto-fonts-cjk');
            console.error('執行: sudo pacman -S noto-fonts-cjk');
            process.exit(1);
        }
        registerFont(FONT_CONFIG.zh.regular.path, { family: FONT_CONFIG.zh.regular.family });
        registerFont(FONT_CONFIG.zh.bold.path, { family: FONT_CONFIG.zh.bold.family });
    }
}

function getFontConfig(lang) {
    return FONT_CONFIG[lang] || FONT_CONFIG.en;
}

// 文字處理函數
function truncateText(text, limit) {
    if (text.length <= limit) return text;
    return text.slice(0, limit) + '...';
}

function splitTextIntoLines(ctx, text, maxWidth, lang) {
    const words = lang === 'zh' ? text.split('') : text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
        const testLine = currentLine + (lang === 'zh' ? word : (currentLine ? ' ' : '') + word);
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && currentLine) {
            lines.push(currentLine);
            currentLine = word;
        } else {
            currentLine = testLine;
        }
    }

    if (currentLine) {
        lines.push(currentLine);
    }

    return lines;
}

async function generateShareImage(postPath) {
    const lang = postPath.includes('/zh/') ? 'zh' : 'en';
    setupFonts(lang);

    console.log(`處理${lang === 'zh' ? '中文' : '英文'}文章: ${postPath}`);

    const fileContent = fs.readFileSync(postPath, 'utf8');
    const { data: frontMatter } = matter(fileContent);

    const canvas = createCanvas(config.width, config.height);
    const ctx = canvas.getContext('2d');

    // 設定背景
    ctx.fillStyle = '#F5F5F4';
    ctx.fillRect(0, 0, config.width, config.height);

    // 裝飾元素
    ctx.fillStyle = '#E7E5E4';
    ctx.beginPath();
    ctx.arc(0, 0, 200, 0, Math.PI * 2);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(config.width, config.height, 160, 0, Math.PI * 2);
    ctx.fill();

    // 漸層效果
    const gradient = ctx.createLinearGradient(0, 0, config.width, config.height);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, config.width, config.height);

    const fontConfig = getFontConfig(lang);


    // 繪製標題
    ctx.font = `bold ${style.title.size}px "${fontConfig.bold.family}"`;
    ctx.fillStyle = '#000000';

    const title = frontMatter.title || 'Untitled';
    const titleLines = splitTextIntoLines(ctx, title, config.width - 100, lang)
        .slice(0, style.title.maxLines);

    // 計算標題整體高度
    const titleTotalHeight = titleLines.length * style.title.lineHeight;
    const titleStartY = (config.height - titleTotalHeight) / 2 - 70;

    // 繪製標題文字
    titleLines.forEach((line, index) => {
        const metrics = ctx.measureText(line);
        const x = (config.width - metrics.width) / 2;
        const y = titleStartY + (index * style.title.lineHeight);
        ctx.fillText(line, x, y);
    });

    // 繪製描述
    const description = frontMatter.description || '';
    if (description) {
        ctx.font = `${style.description.size}px "${fontConfig.regular.family}"`;
        ctx.fillStyle = '#57534E';

        // 截斷描述文字
        const charLimit = style.description.charLimit[lang];
        const truncatedDesc = truncateText(description, charLimit);

        // 分成兩行
        const descLines = splitTextIntoLines(ctx, truncatedDesc, config.width - 150, lang)
            .slice(0, style.description.maxLines);

        const descStartY = titleStartY + titleTotalHeight + style.title.marginBottom;

        descLines.forEach((line, index) => {
            const metrics = ctx.measureText(line);
            const x = (config.width - metrics.width) / 2;
            const y = descStartY + (index * style.description.lineHeight);
            ctx.fillText(line, x, y);
        });
    }

    // 繪製網站名稱
    ctx.font = `${style.siteName.size}px "${fontConfig.regular.family}"`;
    ctx.fillStyle = '#666666';
    const siteName = '醫學二三四 | Med234';
    const siteNameMetrics = ctx.measureText(siteName);
    ctx.fillText(siteName,
        (config.width - siteNameMetrics.width) / 2,
        config.height - style.siteName.marginBottom
    );

    // 保存圖片
    // 從文章路徑中提取語言資訊
    const langPath = postPath.includes('/zh/') ? 'zh' : 'en';

    // 構建完整的輸出路徑
    const outputDir = path.join(
        process.cwd(),
        config.outputDir,
        'posts',
        langPath
    );

    // 確保輸出目錄存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const postName = path.basename(postPath, '.md');
    const outputPath = path.join(outputDir, `${postName}-share.png`);

    // 檢查文件是否已存在
    if (fs.existsSync(outputPath)) {
        console.log(`📌 圖片已存在: ${outputPath}`);
        return outputPath;
    }

    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outputPath, buffer);

    console.log(`✅ 生成圖片: ${outputPath}`);
    return outputPath;
}

// 命令行相關的函數保持不變
async function generateSingle(lang, filename) {
    const postPath = path.join(process.cwd(), config.postsDir, lang, filename);

    if (!fs.existsSync(postPath)) {
        console.error(`❌ 找不到文件: ${postPath}`);
        console.error(`請確認文件路徑: _posts/${lang}/${filename}`);
        process.exit(1);
    }

    try {
        const imagePath = await generateShareImage(postPath);
        console.log('✨ 分享圖片生成成功！');
    } catch (error) {
        console.error('💥 生成過程發生錯誤:', error);
        process.exit(1);
    }
}

async function processAllPosts() {
    const postsPattern = path.join(process.cwd(), config.postsDir, '{en,zh}', '*.md');
    const postFiles = glob.sync(postsPattern);

    if (postFiles.length === 0) {
        console.error('❌ 找不到任何文章文件');
        console.error(`請確認文章是否位於 ${config.postsDir}/{en,zh}/ 目錄下`);
        process.exit(1);
    }

    console.log(`🔍 找到 ${postFiles.length} 篇文章`);

    for (const postFile of postFiles) {
        try {
            await generateShareImage(postFile);
        } catch (error) {
            console.error(`❌ 處理 ${postFile} 時發生錯誤:`, error);
        }
    }

    console.log('✨ 所有圖片生成完成！');
}

// 處理命令行參數
const args = process.argv.slice(2);

if (args.length > 0) {
    if (args[0] === '--help' || args[0] === '-h') {
        console.log(`
使用方法:
  1. 生成所有文章的分享圖片:
     yarn share-image

  2. 生成特定文章的分享圖片:
     yarn share-image <語言> <文件名>

  例如:
     yarn share-image zh hello-world.md
     yarn share-image en my-post.md
        `);
        process.exit(0);
    }

    if (args.length === 2) {
        const [lang, filename] = args;
        const mdFilename = filename.endsWith('.md') ? filename : `${filename}.md`;
        generateSingle(lang, mdFilename);
    } else {
        console.error('❌ 參數錯誤');
        console.error('請提供語言和文件名，例如: yarn share-image zh hello-world.md');
        process.exit(1);
    }
} else {
    processAllPosts();
}

module.exports = {
    generateShareImage,
    generateSingle,
    processAllPosts
};

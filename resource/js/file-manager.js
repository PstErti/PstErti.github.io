class FileManager {
    constructor() {
        this.initialized = true;
    }

    async loadDirectory(directory) {
        try {
            const response = await fetch(`${CONFIG.basePath}/${directory}/directory.json`);
            if (!response.ok) throw new Error('无法加载目录');

            const data = await response.json();
            // 确保返回的是数组格式
            const files = Array.isArray(data) ? data : 
                         Array.isArray(data.files) ? data.files : [];
            
            // 统一文件对象格式
            return files.map(file => ({
                name: file.name || file.path.split('/').pop(),
                path: file.path
            }));
        } catch (error) {
            console.error('加载目录失败:', error);
            throw error;
        }
    }

    async loadContent(filename) {
        try {
            // 修正路径拼接问题
            const fullPath = `${CONFIG.basePath}/${filename}`;
            console.log('加载文件:', fullPath);
            
            const response = await fetch(fullPath);
            if (!response.ok) throw new Error('无法加载文件内容');

            const content = await response.text();
            const processedContent = this.preprocessContent(content);
            const highlightedContent = window.Highlighter ? 
                window.Highlighter.highlight(processedContent) : 
                processedContent;
            
            return {
                content: this.formatContent(highlightedContent),
                title: filename.split('/').pop()
            };
        } catch (error) {
            console.error('加载内容失败:', error);
            throw error;
        }
    }

    async getLineCount(filename) {
        try {
            const fullPath = `${CONFIG.basePath}/${filename}`;
            const response = await fetch(fullPath);
            if (!response.ok) throw new Error('无法加载文件内容');

            const content = await response.text();
            return content.split('\n').length;
        } catch (error) {
            console.error('获取行数失败:', error);
            throw error;
        }
    }

    preprocessContent(content) {
        // 按照正确的顺序处理特殊字符
        return content
            .replace(/&/g, '&amp;')     // 必须首先处理&
            .replace(/</g, '&lt;')      // 然后处理<
            .replace(/>/g, '&gt;')      // 最后处理>
            .replace(/\t/g, '    ');    // 将制表符转换为空格
    }

    formatContent(content) {
        return content.split('\n')
            .map(line => `<div class="code-line">${line || '&nbsp;'}</div>`)
            .join('');
    }

    renderContent(content, filename) {
        const lines = content.split('\n');
        // 预处理时保留原始格式
        const preprocessedContent = this.preprocessContent(content);
        
        // 使用highlighter接口
        const processedCode = window.Highlighter ? 
            window.Highlighter.highlight(preprocessedContent) : 
            preprocessedContent;
        
        const processedLines = processedCode.split('\n');
        this.renderLines(lines.length, processedLines);
        this.titleElement.textContent = filename.split('/').pop();
    }

    renderLines(lineCount, highlightedLines) {
        this.codeContent.innerHTML = '';
        this.lineNumbers.innerHTML = '';
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < lineCount; i++) {
            const lineNumber = document.createElement('div');
            lineNumber.className = 'code-frame__line-number';
            lineNumber.textContent = i + 1;
            this.lineNumbers.appendChild(lineNumber);

            const lineDiv = document.createElement('div');
            lineDiv.className = 'code-frame__code-line';
            // 确保空行也能正确显示
            lineDiv.innerHTML = highlightedLines[i] || '&nbsp;';
            fragment.appendChild(lineDiv);
        }

        this.codeContent.appendChild(fragment);
    }

    handleError(message) {
        this.codeContent.innerHTML = message;
        this.lineNumbers.innerHTML = '';
        this.titleElement.textContent = '加载失败';
    }
}

// 修改初始化时机
window.addEventListener('DOMContentLoaded', () => {
    window.fileManager = new FileManager();
});

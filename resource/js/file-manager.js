class FileManager {
    constructor() {
        // 将初始化延迟到 DOMContentLoaded 事件
        document.addEventListener('DOMContentLoaded', () => {
            this.initializeElements();
        });
    }

    initializeElements() {
        this.dropdownElement = document.getElementById('fileMenuDropdown');
        this.codeContent = document.querySelector('.code-frame__code');
        this.lineNumbers = document.querySelector('.code-frame__line-numbers');
        this.titleElement = document.querySelector('.title');
        this.menuBtn = document.getElementById('fileMenuBtn');

        if (this.validateElements()) {
            this.isMenuOpen = false;
            this.init();
        }
    }

    validateElements() {
        const elements = {
            'dropdownElement': this.dropdownElement,
            'codeContent': this.codeContent,
            'lineNumbers': this.lineNumbers,
            'titleElement': this.titleElement,
            'menuBtn': this.menuBtn
        };

        const missingElements = Object.entries(elements)
            .filter(([_, element]) => !element)
            .map(([name]) => name);

        if (missingElements.length > 0) {
            console.error('缺少必要元素:', missingElements.join(', '));
            return false;
        }
        return true;
    }

    init() {
        if (!this.menuBtn || !this.dropdownElement) {
            console.error('菜单元素未找到');
            return;
        }

        // 确保下拉菜单初始状态正确
        this.dropdownElement.style.display = 'none';
        this.dropdownElement.classList.remove('show');

        this.menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        document.addEventListener('click', (e) => {
            if (!this.menuBtn.contains(e.target) && !this.dropdownElement.contains(e.target)) {
                this.closeMenu();
            }
        });
    }

    toggleMenu() {
        this.isMenuOpen = !this.isMenuOpen;
        if (this.isMenuOpen) {
            this.dropdownElement.style.display = 'block';
            requestAnimationFrame(() => {
                this.dropdownElement.classList.add('show');
            });
        } else {
            this.dropdownElement.style.display = 'none';
            this.dropdownElement.classList.remove('show');
        }
    }

    closeMenu() {
        if (!this.isMenuOpen) return;
        this.isMenuOpen = false;
        this.dropdownElement.style.display = 'none';
        this.dropdownElement.classList.remove('show');
    }

    async loadDirectory(directory = 'MainPage') {
        try {
            const response = await fetch(CONFIG.directoryFile);
            if (!response.ok) throw new Error('无法加载目录');

            const files = await response.json();
            this.dropdownElement.innerHTML = '';

            // 过滤出 MainPage 目录下的文件
            const mainPageFiles = files.filter(file => file.path.startsWith(directory));

            // 在菜单中显示文件名
            mainPageFiles.forEach(file => {
                const option = document.createElement('div');
                option.className = 'menu-option';
                option.textContent = file.name;
                option.onclick = () => {
                    // 点击时加载文件内容
                    const filePath = `${CONFIG.basePath}/${file.path}`;
                    this.loadContent(filePath);
                };
                this.dropdownElement.appendChild(option);
            });

            // 如果有文件，加载第一个文件作为默认显示
            if (mainPageFiles.length > 0) {
                const firstFile = `${CONFIG.basePath}/${mainPageFiles[0].path}`;
                this.loadContent(firstFile);
            }
        } catch (error) {
            console.error('加载目录失败:', error);
            this.handleError('无法加载目录列表');
        }
    }

    async loadContent(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) throw new Error('无法加载文件内容');

            const content = await response.text();
            // 检查内容是否为HTML
            if (content.trim().toLowerCase().startsWith('<!doctype html') ||
                content.trim().toLowerCase().startsWith('<html')) {
                throw new Error('无效的文件格式');
            }

            this.renderContent(content, filename);
            this.closeMenu();
        } catch (error) {
            console.error('加载内容失败:', error);
            this.handleError(error.message);
        }
    }

    renderContent(content, filename) {
        const lines = content.split('\n');
        const escapedCode = content.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        const highlightedCode = window.Highlighter ?
            window.Highlighter.highlight(escapedCode) :
            escapedCode;
        const highlightedLines = highlightedCode.split('\n');

        this.renderLines(lines, highlightedLines);
        this.titleElement.textContent = filename.split('/').pop();
    }

    renderLines(lines, highlightedLines) {
        this.codeContent.innerHTML = '';
        this.lineNumbers.innerHTML = '';
        const fragment = document.createDocumentFragment();

        lines.forEach((_, index) => {
            const lineNumber = document.createElement('div');
            lineNumber.className = 'code-frame__line-number';
            lineNumber.textContent = index + 1;
            this.lineNumbers.appendChild(lineNumber);

            const lineDiv = document.createElement('div');
            lineDiv.className = 'code-frame__code-line';
            lineDiv.innerHTML = highlightedLines[index] || ' ';
            fragment.appendChild(lineDiv);
        });

        this.codeContent.appendChild(fragment);
    }

    handleError(message) {
        this.codeContent.innerHTML = message;
        this.lineNumbers.innerHTML = '';
        this.titleElement.textContent = '加载失败';
    }
}

// 改为在DOMContentLoaded事件中创建实例
document.addEventListener('DOMContentLoaded', () => {
    window.fileManager = new FileManager();
});

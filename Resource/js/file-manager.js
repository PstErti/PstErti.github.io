class FileManager {
    constructor() {
        this.dropdownElement = document.getElementById('fileMenuDropdown');
        this.codeContent = document.querySelector('.code-frame__code');
        this.lineNumbers = document.querySelector('.code-frame__line-numbers');
        this.titleElement = document.querySelector('.title');
        this.menuBtn = document.getElementById('fileMenuBtn');
        this.isMenuOpen = false;
        this.init();
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

    async loadDirectory() {
        try {
            const response = await fetch(CONFIG.directoryFile);
            if (!response.ok) throw new Error('无法加载目录');
            
            const files = await response.json();
            this.dropdownElement.innerHTML = '';

            files.forEach(file => {
                const option = document.createElement('div');
                option.className = 'menu-option';
                option.textContent = file.name;
                option.onclick = () => this.loadFile(`${CONFIG.basePath}/${file.path}`);
                this.dropdownElement.appendChild(option);
            });
        } catch (error) {
            console.error('加载目录失败:', error);
        }
    }

    async loadFile(filename) {
        try {
            const response = await fetch(filename);
            if (!response.ok) {
                throw new Error(response.status === 404 ? 
                    '文件未找到: ' + filename : 
                    '网络响应错误: ' + response.status
                );
            }
            
            const content = await response.text();
            this.renderContent(content, filename);
            this.closeMenu();
            
        } catch (error) {
            console.error('Error:', error);
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

// 创建全局实例
window.fileManager = new FileManager();

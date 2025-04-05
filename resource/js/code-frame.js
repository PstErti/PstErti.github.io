class CodeFrame {
    constructor(config = {}) {
        const defaultConfig = {
            marginTop: '30px'
        };
        this.config = { ...defaultConfig, ...config };
    }

    initialize() {
        if (!this.setupFrame()) {
            console.error('框架初始化失败');
            return;
        }

        if (window.fileManager) {
            this.loadDirectory('MainPage');
        } else {
            this.showError('FileManager 未初始化');
        }
    }

    setupFrame() {
        this.frame = document.querySelector('.code-frame');
        if (!this.frame) {
            this.showError('找不到 code-frame 元素');
            return false;
        }

        this.frame.style.marginTop = this.config.marginTop;

        this.frame.innerHTML = `
            <div class="code-frame__title-bar">
                <div class="title-section">
                    <div class="dots">
                        <div class="dot dot-red" onclick="window.close()"></div>
                        <div class="dot dot-yellow"></div>
                        <div class="dot dot-green"></div>
                    </div>
                    <div class="title active">AboutPstErti.cpp</div>
                </div>
                <div class="file-menu">
                    <span class="menu-item" id="fileMenuBtn">文件</span>
                    <div class="menu-dropdown" id="fileMenuDropdown"></div>
                </div>
            </div>
            <div class="code-frame__content">
                <div class="code-frame__line-numbers" id="lineNumbers"></div>
                <div class="code-frame__code" id="codeContent"></div>
                <div class="error-display" style="display:none;"></div>
            </div>
        `;

        this.initMenuHandlers();
        return true;
    }

    initMenuHandlers() {
        this.menuVisible = false;
        // 确保在setupFrame之后获取元素
        const menu = this.frame.querySelector('#fileMenuDropdown');
        const menuBtn = this.frame.querySelector('#fileMenuBtn');

        if (!menu || !menuBtn) {
            console.error('菜单元素未找到');
            return;
        }

        // 设置为类属性
        this.fileMenu = menu;
        this.fileMenuBtn = menuBtn;

        this.fileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.toggleMenu();
        });

        document.addEventListener('click', (e) => {
            if (this.menuVisible && !e.target.closest('.file-menu')) {
                this.hideMenu();
            }
        });
    }

    async loadDirectory(path) {
        try {
            if (!this.frame || !this.fileMenu) {
                throw new Error('框架未正确初始化');
            }

            const files = await window.fileManager.loadDirectory(path);
            if (!Array.isArray(files)) {
                throw new Error('无效的文件列表格式');
            }
            this.updateFileMenu(files);
            
            // 如果有文件，自动加载第一个
            if (files.length > 0) {
                await this.displayFile(`${CONFIG.basePath}/${files[0].path}`);
            }
        } catch (error) {
            const errorMessage = error.message || '未知错误';
            console.error('目录加载失败:', errorMessage);
            this.showError(`目录加载失败: ${errorMessage}`);
        }
    }

    updateFileMenu(files) {
        if (!Array.isArray(files) || files.length === 0) {
            this.fileMenu.innerHTML = '<div class="menu-option">无可用文件</div>';
            return;
        }

        const menuContent = files.map(file => `
            <div class="menu-option" data-file="${file.path}">${file.name}</div>
        `).join('');

        this.fileMenu.innerHTML = menuContent;

        this.fileMenu.querySelectorAll('.menu-option').forEach(option => {
            option.addEventListener('click', async (e) => {
                e.preventDefault();
                e.stopPropagation();
                const filePath = option.dataset.file;
                await this.displayFile(filePath);
                this.hideMenu();
            });
        });

        this.fileMenu.addEventListener('click', (e) => e.stopPropagation());
    }

    async displayFile(filePath) {
        try {
            const relativePath = filePath.replace(`${CONFIG.basePath}/`, '');
            const [{ content, title }, lineCount] = await Promise.all([
                window.fileManager.loadContent(relativePath),
                window.fileManager.getLineCount(relativePath)
            ]);
            
            const titleBar = this.frame.querySelector('.title');
            const codeContent = this.frame.querySelector('#codeContent');
            const lineNumbers = this.frame.querySelector('#lineNumbers');
            
            titleBar.textContent = title;
            titleBar.setAttribute('title', title);
            codeContent.innerHTML = content;
            
            // 使用getLineCount的返回值
            lineNumbers.innerHTML = Array.from(
                { length: lineCount },
                (_, i) => `<div class="line-number">${i + 1}</div>`
            ).join('');
            
            this.showError('');
        } catch (error) {
            this.showError(`文件加载失败: ${error.message}`);
        }
    }

    toggleMenu() {
        if (this.menuVisible) {
            this.hideMenu();
        } else {
            this.showMenu();
        }
    }

    showMenu() {
        console.log('显示菜单');
        this.menuVisible = true;
        requestAnimationFrame(() => {
            this.fileMenu.classList.add('show');
            this.fileMenu.style.display = 'block';
        });
    }

    hideMenu() {
        console.log('隐藏菜单');
        this.menuVisible = false;
        requestAnimationFrame(() => {
            this.fileMenu.classList.remove('show');
            this.fileMenu.style.display = 'none';
        });
    }

    showError(message) {
        console.error(message);
        
        if (!this.frame) {
            return;
        }

        const errorDisplay = this.frame.querySelector('.error-display');
        if (errorDisplay) {
            errorDisplay.textContent = message;
            errorDisplay.style.display = message ? 'block' : 'none';
        }
    }
}

// 修改初始化时机
window.addEventListener('load', () => {
    const codeFrame = new CodeFrame();
    codeFrame.initialize();
});

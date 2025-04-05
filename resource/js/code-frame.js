class CodeFrame {
    constructor(config = {}) {
        const defaultConfig = {
            marginTop: '30px'
        };
        this.config = { ...defaultConfig, ...config };

        this.frame = document.querySelector('.code-frame');
        this.frame.style.marginTop = this.config.marginTop;

        this.frame.innerHTML = `
            <div class="code-frame__title-bar">
                <div class="title-section">
                    <div class="dots">
                        <div class="dot dot-red" onclick="window.close()"></div>
                        <div class="dot dot-yellow"></div>
                        <div class="dot dot-green"></div>
                    </div>
                    <div class="title">AboutPstErti.cpp</div>
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

        // 初始化DOM引用
        this.titleBar = this.frame.querySelector('.code-frame__title-bar .title');
        this.lineNumbers = this.frame.querySelector('#lineNumbers');
        this.codeContent = this.frame.querySelector('#codeContent');
        this.fileMenu = this.frame.querySelector('#fileMenuDropdown');
        this.fileMenuBtn = this.frame.querySelector('#fileMenuBtn');
        this.errorDisplay = this.frame.querySelector('.error-display');

        // 确保所有DOM引用都存在
        if (!this.fileMenu || !this.fileMenuBtn) {
            console.error('菜单元素未找到');
            return;
        }

        this.menuVisible = false; // 添加状态标记

        // 文件菜单事件绑定
        this.fileMenuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            console.log('菜单按钮点击，当前状态:', this.menuVisible);
            this.toggleMenu();
        });

        // 点击外部关闭菜单
        document.addEventListener('click', (e) => {
            if (this.menuVisible && !e.target.closest('.file-menu')) {
                this.hideMenu();
            }
        });

        // 菜单项点击事件直接在updateFileMenu中处理
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

    async loadDirectory(path) {
        console.group('加载目录');
        console.log('请求路径:', `resource/article/${path}/directory.json`);

        try {
            const response = await fetch(`resource/article/${path}/directory.json`);
            if (!response.ok) {
                console.error('HTTP错误:', response.status, response.statusText);
                throw new Error(`加载失败 (${response.status})`);
            }

            const data = await response.json();
            console.log('接收到的数据:', data);

            if (!data.files || !Array.isArray(data.files)) {
                console.error('无效的数据格式:', data);
                throw new Error('目录格式无效');
            }

            console.log('文件列表:', data.files);
            this.updateFileMenu(data.files);

            if (data.files.length > 0) {
                await this.loadFile(data.files[0].path);
            }
        } catch (error) {
            console.error('加载失败:', error);
            this.showError(`目录加载失败: ${error.message}`);
        } finally {
            console.groupEnd();
        }
    }

    updateFileMenu(files) {
        console.log('更新文件菜单:', files);
        const menuContent = files.map(file => `
            <div class="menu-option" data-file="${file.path}">${file.name}</div>
        `).join('');

        this.fileMenu.innerHTML = menuContent;
        console.log('更新后的菜单HTML:', this.fileMenu.innerHTML);

        this.fileMenu.querySelectorAll('.menu-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                const filePath = option.dataset.file;
                this.loadFile(filePath);
                this.menuVisible = false; // 更新菜单状态
                this.hideMenu();
            });
        });

        // 给文件菜单添加点击事件阻止冒泡
        this.fileMenu.addEventListener('click', (e) => {
            e.stopPropagation();
        });
    }

    async loadFile(filePath) {
        try {
            const response = await fetch(`resource/article/${filePath}`);
            if (!response.ok) throw new Error(`加载失败 (${response.status})`);

            const content = await response.text();
            this.displayFile({
                displayTitle: filePath.split('/').pop() || 'Untitled',
                content
            });
            this.showError('');
        } catch (error) {
            this.showError(`文件加载失败: ${error.message}`);
        }
    }

    displayFile(fileData) {
        this.titleBar.textContent = fileData.displayTitle;
        const lines = fileData.content.split('\n');

        this.lineNumbers.innerHTML = Array.from(
            { length: lines.length },
            (_, i) => `<div class="line-number">${i + 1}</div>`
        ).join('');

        this.codeContent.innerHTML = lines.map(line =>
            `<div class="code-line">${line || '&nbsp;'}</div>`
        ).join('');
    }

    showError(message) {
        this.errorDisplay.textContent = message;
        this.errorDisplay.style.display = message ? 'block' : 'none';
    }
}

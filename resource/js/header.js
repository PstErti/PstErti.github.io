class Header {
    constructor(config = {}) {
        const defaultConfig = {
            logo: 'resource/texture/logo-PstErti-500x188.png',
            title: 'PstErti',
            navLinks: [
                { text: '主页', url: '#' },
                { text: '博客', url: '#' },
                { text: '项目', url: '#' },
                { text: '关于', url: '#' }
            ]
        };

        this.config = { ...defaultConfig, ...config };
        this.container = document.createElement('header');
        this.container.className = 'header';
        this.init(this.config);

        // 从localStorage获取当前主题设置
        const currentTheme = localStorage.getItem('theme') || 'dark';
        this.setThemeIcon(currentTheme === 'dark');
    }

    init(config) {
        // 确保容器有固定高度和正确的定位
        this.container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            z-index: 1000;
            height: 50px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
        `;

        const isSubPage = window.location.pathname.includes('/pages/');
        const basePath = isSubPage ? '../' : '';

        this.container.innerHTML = `
            <div class="header__left" style="display: flex; align-items: center; gap: 30px;">
                <div class="header__logo">
                    <img src="${basePath}resource/texture/logo-PstErti-500x188.png" alt="PstErti" style="height: 40px; width: auto; filter: var(--color-logoTint);">
                </div>
                <div class="divider"></div>
                <div class="header__title">${config.title || ''}</div>
                <div class="divider"></div>
                <nav class="header__nav" style="display: flex; gap: 15px;">
                    <a href="${basePath}index.html" class="nav-link">主页</a>
                    <a href="${basePath}pages/blog.html" class="nav-link">博客</a>
                    <a href="${basePath}pages/projects.html" class="nav-link">项目</a>
                    <a href="${basePath}pages/about.html" class="nav-link">关于</a>
                </nav>
            </div>
            <button class="theme-switch" title="切换主题" style="width: 20px; height: 20px; padding: 0; margin-left: auto; margin-right: 30px;">
                <img class="sun" src="${basePath}resource/texture/sun.svg" alt="light theme" style="width: 100%; height: 100%;">
                <img class="moon" src="${basePath}resource/texture/moon.svg" alt="dark theme" style="width: 100%; height: 100%; display:none;">
            </button>
        `;

        this.themeSwitch = this.container.querySelector('.theme-switch');
        this.themeSwitch.addEventListener('click', () => {
            if (this.onThemeSwitch) this.onThemeSwitch();
        });
    }

    mount(parent) {
        parent.prepend(this.container);
    }

    setThemeIcon(isDark) {
        const sunIcon = this.container.querySelector('.sun');
        const moonIcon = this.container.querySelector('.moon');
        // 反转显示逻辑：暗色主题显示太阳，浅色主题显示月亮
        sunIcon.style.display = isDark ? 'block' : 'none';
        moonIcon.style.display = isDark ? 'none' : 'block';
    }

    onThemeSwitch(callback) {
        this.onThemeSwitch = callback;
    }

    inject(selector) {
        const target = document.querySelector(selector);
        if (!target) {
            console.error('Header: 目标容器不存在 -', selector);
            return false;
        }

        // 确保注入到 body 的开头
        document.body.insertBefore(this.container, document.body.firstChild);
        return true;
    }
}

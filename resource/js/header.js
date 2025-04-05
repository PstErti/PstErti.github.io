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

        // 获取当前页面路径
        const currentPath = window.location.pathname;
        const navLinks = {
            'index.html': '主页',
            'pages/blog.html': '博客',
            'pages/projects.html': '项目',
            'pages/about.html': '关于'
        };

        this.container.innerHTML = `
            <div class="header__left" style="display: flex; align-items: center; gap: 30px;">
                <div class="header__logo">
                    <img src="${basePath}resource/texture/logo-PstErti-500x188.png" alt="PstErti" style="height: 40px; width: auto; filter: var(--color-logoTint);">
                </div>
                <div class="divider header-divider"></div>
                <div class="header__title header-title">${config.title || ''}</div>
                <div class="divider header-divider"></div>
                <nav class="header__nav" style="display: flex; gap: 15px;">
                    ${Object.entries(navLinks).map(([path, text]) => {
                        const isActive = currentPath.endsWith(path) || 
                                       (path === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')));
                        return `<a href="${basePath}${path}" class="nav-link${isActive ? ' active' : ''}">${text}</a>`;
                    }).join('')}
                </nav>
            </div>
            <div class="theme-switch" title="切换主题">
                <div class="switch-track"></div>
                <img class="switch-icon sun" src="${basePath}resource/texture/sun.svg" alt="light theme">
                <img class="switch-icon moon" src="${basePath}resource/texture/moon.svg" alt="dark theme">
            </div>
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
        const switchIcons = this.container.querySelectorAll('.switch-icon');
        switchIcons.forEach(icon => {
            if (isDark) {
                icon.classList.add('dark');
            } else {
                icon.classList.remove('dark');
            }
        });
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

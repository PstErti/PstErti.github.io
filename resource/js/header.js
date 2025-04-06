class Header {
    constructor(config = {}) {
        const defaultConfig = {
            logo: 'resource/texture/logo-PstErti-500x188.png',
            title: 'Home',
            navLinks: [
                { text: '主页', url: '/' },
                { text: '博客', url: '/blog' },
                { text: '项目', url: '/projects' },
                { text: '关于', url: '/about' }
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

        this.container.innerHTML = `
            <div class="header__left" style="display: flex; align-items: center; gap: 30px;">
                <div class="header__logo">
                    <img src="${basePath}resource/texture/logo-PstErti-500x188.png" alt="PstErti" style="height: 40px; width: auto; filter: var(--color-logoTint);">
                </div>
                <div class="divider header-divider"></div>
                <div class="header__title header-title">${config.title || ''}</div>
                <div class="divider header-divider"></div>
                <nav class="header__nav" style="display: flex; gap: 15px;">
                    ${config.navLinks.map(({text, url}) => {
                        const isActive = currentPath.endsWith(url) || 
                                       (url === 'index.html' && (currentPath === '/' || currentPath.endsWith('/')));
                        return `<a href="${basePath}${url}" class="nav-link${isActive ? ' active' : ''}">${text}</a>`;
                    }).join('')}
                </nav>
            </div>
            <div class="theme-switch" title="切换主题">
                <div class="switch-track"></div>
                <img class="switch-icon sun" src="${basePath}resource/texture/sun.svg" alt="light theme">
                <img class="switch-icon moon" src="${basePath}resource/texture/moon.svg" alt="dark theme">
            </div>
        `;

        // 为所有导航链接添加点击事件监听
        const navLinks = this.container.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.classList.contains('active')) {
                    e.preventDefault();
                }
            });
        });

        // 修改事件监听的绑定方式
        this.themeSwitch = this.container.querySelector('.theme-switch');
        this.themeSwitch.addEventListener('click', () => {
            this.toggleTheme();  // 直接调用 toggleTheme
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

    initThemeSwitch() {
        const switchBtn = document.querySelector('.theme-switch');
        if (switchBtn) {
            switchBtn.addEventListener('click', () => this.toggleTheme());
        }
    }

    toggleTheme() {
        const prefersDark = localStorage.getItem('theme') === 'dark';
        const newTheme = prefersDark ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        this.setThemeIcon(newTheme === 'dark');

        // 确保回调存在时才调用
        if (typeof this.onThemeSwitch === 'function') {
            this.onThemeSwitch(newTheme);
        }
    }
}

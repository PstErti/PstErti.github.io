class ProjectPage {
    constructor() {
        // 立即应用主题，不等待 DOMContentLoaded
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const isDarkTheme = localStorage.getItem('theme') === null ?
            prefersDark :
            localStorage.getItem('theme') !== 'light';
        this.applyTheme(isDarkTheme ? 'dark' : 'light');

        document.addEventListener('DOMContentLoaded', () => {
            this.init();
        });
    }

    init() {
        this.header = new Header({ title: 'Project' });
        this.footer = new Footer();
        this.initContent();

        this.header.inject('#header');
        this.header.onThemeSwitch = () => this.toggleTheme();

        // 设置初始主题图标
        const currentTheme = localStorage.getItem('theme') || 'dark';
        this.header.setThemeIcon(currentTheme === 'dark');
    }

    initContent() {
        const content = document.querySelector('.content');
        content.style.maxWidth = '800px';
        content.style.width = '100%';
        content.style.margin = '30px auto';
        content.style.padding = '0 20px';
    }

    applyTheme(theme) {
        const colors = ThemeManager.getTheme(theme);
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
        });

        // 更新页脚颜色
        const footerElement = document.querySelector('.footer-container');
        if (footerElement) {
            footerElement.style.setProperty('color', colors.menuText);
        }
    }

    toggleTheme() {
        const currentTheme = localStorage.getItem('theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('theme', newTheme);
        this.applyTheme(newTheme);
    }
}

new ProjectPage();

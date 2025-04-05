class AboutPage {
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
        this.header = new Header({ title: 'About' });
        this.footer = new Footer();
        this.initContent();

        this.header.inject('#header');
        this.header.onThemeSwitch((theme) => this.applyTheme(theme));

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
    }
}

new AboutPage();

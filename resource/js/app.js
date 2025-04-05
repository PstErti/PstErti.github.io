class App {
    constructor() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme = localStorage.getItem('theme') === null ?
            prefersDark :
            localStorage.getItem('theme') !== 'light';

        this.themeButton = document.querySelector('.theme-switch');
        this.codeFrame = new CodeFrame({
            marginTop: '50px'  // 可以根据需要调整距离
        });
        this.initHeader();
        this.init();

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                if (localStorage.getItem('theme') === null) {
                    this.isDarkTheme = e.matches;
                    this.applyTheme(this.isDarkTheme ? 'dark' : 'light');
                }
            });
    }

    init() {
        this.applyTheme(this.isDarkTheme ? 'dark' : 'light');
        this.setupEventListeners();
        this.codeFrame.loadDirectory('MainPage');
    }

    initHeader() {
        const headerConfig = {
            logo: 'resource/texture/logo-PstErti-500x188.png',
            title: 'Home',
            navLinks: [
                { text: '主页', url: '#' },
                { text: '博客', url: '#' },
                { text: '项目', url: '#' },
                { text: '关于', url: '#' }
            ]
        };

        this.header = new Header(headerConfig);
        this.header.inject('#header');  // 使用 inject 替换 mount
        this.header.onThemeSwitch = () => this.toggleTheme();
    }

    setupEventListeners() {
        const fileMenuBtn = document.getElementById('fileMenuBtn');
        if (!fileMenuBtn) return;  // 如果按钮不存在则返回

        document.addEventListener('click', e => {
            const dropdown = document.getElementById('fileMenuDropdown');
            if (dropdown && !fileMenuBtn.contains(e.target)) {
                dropdown.classList.remove('show');
            }
        });

        fileMenuBtn.addEventListener('click', e => {
            e.stopPropagation();
            const dropdown = document.getElementById('fileMenuDropdown');
            if (dropdown) {
                dropdown.classList.toggle('show');
            }
        });
    }

    applyTheme(theme) {
        const colors = ThemeManager.getTheme(theme);
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
        });
    }

    toggleTheme() {
        this.isDarkTheme = !this.isDarkTheme;
        const theme = this.isDarkTheme ? 'dark' : 'light';
        this.applyTheme(theme);
        localStorage.setItem('theme', theme);
        this.header.setThemeIcon(this.isDarkTheme);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

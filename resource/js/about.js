class AboutPage {
    constructor() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme = localStorage.getItem('theme') === null ?
            prefersDark :
            localStorage.getItem('theme') !== 'light';

        this.header = new Header({
            title: 'About',
            navLinks: [
                { text: '主页', url: 'pages/home.html' },
                { text: '博客', url: 'pages/blog.html' },
                { text: '项目', url: 'pages/projects.html' },
                { text: '关于', url: 'pages/about.html' }
            ]
        });
        this.footer = new Footer();

        this.init();

        window.matchMedia('(prefers-color-scheme: dark)')
            .addEventListener('change', e => {
                if (localStorage.getItem('theme') === null) {
                    this.isDarkTheme = e.matches;
                    this.applyTheme(this.isDarkTheme ? 'dark' : 'light');
                }
            });


        const maintenance = MaintenanceMode.initialize();
        maintenance.show();
    }

    init() {
        this.header.inject('#header');
        this.header.onThemeSwitch = (theme) => this.applyTheme(theme);
        this.footer.inject('#footer');
        this.initContent();

        this.applyTheme(this.isDarkTheme ? 'dark' : 'light');
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

window.addEventListener('DOMContentLoaded', () => {
    window.aboutPage = new AboutPage();
});

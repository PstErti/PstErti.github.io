class App {
    constructor() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme = localStorage.getItem('theme') === null ?
            prefersDark :
            localStorage.getItem('theme') !== 'light';
        
        this.header = new Header({
            title: 'Home',
            navLinks: [
                { text: '主页', url: 'pages/home.html' },
                { text: '博客', url: 'pages/blog.html' },
                { text: '项目', url: 'pages/projects.html' },
                { text: '关于', url: 'pages/about.html' }
            ]
        });
        this.codeFrame = new CodeFrame({
            marginTop: '50px'
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

        // Uncomment the following lines to enable maintenance mode
        // const maintenance = MaintenanceMode.initialize();
        // maintenance.show();
    }
 
    init() {
        // 按顺序初始化组件
        this.header.inject('#header');
        this.header.onThemeSwitch = (theme) => this.applyTheme(theme);
        
        // 确保在 FileManager 初始化后再初始化 CodeFrame
        if (window.fileManager && window.fileManager.initialized) {
            this.codeFrame.initialize();
        } else {
            console.error('FileManager 未正确初始化');
        }

        this.footer.inject('#footer');
        
        this.applyTheme(this.isDarkTheme ? 'dark' : 'light');
        this.codeFrame.loadDirectory('MainPage');
    }
 
    applyTheme(theme) {
        const colors = ThemeManager.getTheme(theme);
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
        });
    }
}

// 全局初始化
window.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

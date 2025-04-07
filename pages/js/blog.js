class BlogPage {
    constructor() {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        this.isDarkTheme = localStorage.getItem('theme') === null ?
            prefersDark :
            localStorage.getItem('theme') !== 'light';
        
        this.header = new Header({
            title: 'Blog',
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

        // Uncomment the following lines to enable maintenance mode
        // const maintenance = MaintenanceMode.initialize();
        // maintenance.show();
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
        content.style.maxWidth = '1200px';
        content.style.width = '100%';
        content.style.margin = '30px auto';
        content.style.display = 'flex';
        content.style.flexDirection = 'column';
        content.style.gap = '20px';

        // 创建四个博客专栏
        const columns = [
            {
                title: '博客标题 1',
                content: '这是第一个博客专栏的简短描述。点击查看更多内容。',
                bgImage: '/resource/texture/blog-column-test-picture.jpg',
                link: '#'
            },
            {
                title: '博客标题 2',
                content: '这是第二个博客专栏的简短描述。点击查看更多内容。',
                bgImage: '/resource/texture/blog-column-test-picture.jpg',
                link: '#'
            },
            {
                title: '博客标题 3',
                content: '这是第三个博客专栏的简短描述。点击查看更多内容。',
                bgImage: '/resource/texture/blog-column-test-picture.jpg',
                link: '#'
            },
            {
                title: '博客标题 4',
                content: '这是第四个博客专栏的简短描述。点击查看更多内容。',
                bgImage: '/resource/texture/blog-column-test-picture.jpg',
                link: '#'
            }
        ];

        // 初始化并挂载所有博客专栏
        columns.forEach(columnData => {
            const column = new BlogColumn(columnData);
            column.mount(content);
        });
    }

    applyTheme(theme) {
        const colors = ThemeManager.getTheme(theme);
        Object.entries(colors).forEach(([key, value]) => {
            document.documentElement.style.setProperty(`--color-${key}`, value);
        });
    }
}

window.addEventListener('DOMContentLoaded', () => {
    window.blogPage = new BlogPage();
});

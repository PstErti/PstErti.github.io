class Footer {
    constructor() {
        this.initialized = false;
    }

    inject(selector) {
        if (this.initialized) return;
        
        const container = document.querySelector(selector);
        if (!container) {
            console.error('Footer container not found');
            return;
        }
        
        const isSubPage = window.location.pathname.includes('/pages/');
        const basePath = isSubPage ? '../' : '';
        
        // 获取当前页面路径
        const currentPath = window.location.pathname;
        
        const footer = document.createElement('div');
        footer.className = 'footer-container';
        footer.innerHTML = `
            <div class="links">
                ${['home', 'blog', 'projects', 'about'].map((page, index) => {
                    const url = `${basePath}pages/${page}.html`;
                    const isActive = currentPath.endsWith(`/${page}.html`);
                    return `<a href="${url}" class="link${isActive ? ' active' : ''}" style="--link-index: ${index}">${page.charAt(0).toUpperCase() + page.slice(1)}</a>`;
                }).join('')}
            </div>
            <div class="copyright">
                <p>© 2025 PstErti. All rights reserved.</p>
            </div>
        `;

        // 添加点击事件监听
        const links = footer.querySelectorAll('.link');
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                if (link.classList.contains('active')) {
                    e.preventDefault();
                }
            });
        });

        container.appendChild(footer);
        this.initialized = true;
    }
}

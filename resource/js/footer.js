class Footer {
    constructor() {
        document.addEventListener('DOMContentLoaded', () => {
            this.initialize();
        });
    }

    initialize() {
        const isSubPage = window.location.pathname.includes('/pages/');
        const basePath = isSubPage ? '../' : '';

        const footer = document.createElement('div');
        footer.className = 'footer-container';
        footer.innerHTML = `
            <div class="links">
                <a href="${basePath}pages/blog.html" class="link">Blog</a>
                <a href="${basePath}pages/projects.html" class="link">Projects</a>
                <a href="${basePath}pages/about.html" class="link">About</a>
            </div>
            <footer>
                © 2025 PstErti. All rights reserved.
            </footer>
        `;

        document.querySelector('.main-container').appendChild(footer);
    }
}

new Footer();

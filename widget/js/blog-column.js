class BlogColumn {
    constructor(options) {
        this.title = options.title || '';
        this.content = options.content || '';
        this.bgImage = options.bgImage || '';
        this.link = options.link || '#';
        this.element = null;
        this.init();
    }

    init() {
        // 创建DOM元素
        this.element = document.createElement('div');
        this.element.className = 'blog-column';

        // 设置HTML结构
        this.element.innerHTML = `
            <div class="blog-column__bg" style="background-image: url(${this.bgImage})"></div>
            <div class="blog-column__content">
                <h3 class="blog-column__title">${this.title}</h3>
                <p class="blog-column__text">${this.content}</p>
                <a href="${this.link}" class="blog-column__link">打开专栏</a>
            </div>
        `;

        // 添加点击事件
        this.element.addEventListener('click', (e) => {
            // 如果点击的不是链接本身，则触发跳转
            if (!e.target.classList.contains('blog-column__link')) {
                window.location.href = this.link;
            }
        });

        // 添加滚动事件监听，使用节流函数优化性能
        this.handleScroll = this.handleScroll.bind(this);
        this.ticking = false; // 用于requestAnimationFrame节流
        window.addEventListener('scroll', () => this.onScroll());
        // 初始化时检查一次位置
        setTimeout(() => this.onScroll(), 100);
    }
    
    // 滚动事件处理，使用requestAnimationFrame优化性能
    onScroll() {
        if (!this.ticking) {
            requestAnimationFrame(() => {
                this.handleScroll();
                this.ticking = false;
            });
            this.ticking = true;
        }
    }

    // 挂载到指定容器
    mount(container) {
        if (typeof container === 'string') {
            container = document.querySelector(container);
        }
        if (container) {
            container.appendChild(this.element);
        }
    }

    handleScroll() {
        const rect = this.element.getBoundingClientRect();
        const windowHeight = window.innerHeight;
        const threshold = 0.15; // 渐变阈值
        
        let opacity = 1;
        
        // 计算元素在视口中的位置
        // 当元素从上边界离开屏幕时，使用下边界作为y坐标
        if (rect.top < 0 && rect.bottom > 0 && rect.bottom < windowHeight * threshold) {
            opacity = rect.bottom / (windowHeight * threshold);
            // 使用缓动函数使渐变更加平滑
            opacity = this.easeInOutQuad(opacity);
        }
        // 当元素从下边界离开屏幕时，使用上边界作为y坐标
        else if (rect.bottom > windowHeight && rect.top < windowHeight && rect.top > windowHeight * (1 - threshold)) {
            opacity = (windowHeight - rect.top) / (windowHeight * threshold);
            // 使用缓动函数使渐变更加平滑
            opacity = this.easeInOutQuad(opacity);
        }
        // 当元素完全在视口外时
        else if (rect.bottom <= 0 || rect.top >= windowHeight) {
            opacity = 0;
        }
        
        // 确保opacity在0到1之间
        opacity = Math.max(0, Math.min(1, opacity));
        
        // 使用transform: translateZ(0)触发GPU加速，提高渲染性能
        this.element.style.opacity = opacity.toString();
        if (opacity > 0 && opacity < 1) {
            this.element.style.transform = 'translateZ(0)';
        } else {
            this.element.style.transform = '';
        }
    }
    
    // 缓动函数，使渐变更加平滑自然
    easeInOutQuad(t) {
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    }
}

// 导出BlogColumn类
window.BlogColumn = BlogColumn;
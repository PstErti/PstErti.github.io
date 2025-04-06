class MaintenanceMode {
    static instance = null;

    static initialize() {
        if (!MaintenanceMode.instance) {
            MaintenanceMode.instance = new MaintenanceMode();
        }
        return MaintenanceMode.instance;
    }

    constructor() {
        if (MaintenanceMode.instance) {
            return MaintenanceMode.instance;
        }
        this.overlay = null;
        MaintenanceMode.instance = this;
    }

    show() {
        if (this.overlay) return;
        
        this.overlay = document.createElement('div');
        this.overlay.className = 'maintenance-overlay';
        
        const box = document.createElement('div');
        box.className = 'maintenance-box';
        
        box.innerHTML = `
            <h2 class="maintenance-title">网页维护中</h2>
            <p class="maintenance-text">网页正在进行维护。请稍后再试。</p>
            <a href="javascript:history.back()" class="maintenance-back">返回上一页</a>
        `;
        
        this.overlay.appendChild(box);
        document.body.appendChild(this.overlay);
        
        // 强制重排后添加active类
        this.overlay.offsetHeight;
        this.overlay.classList.add('active');
    }

    hide() {
        if (this.overlay) {
            this.overlay.classList.remove('active');
            setTimeout(() => {
                this.overlay.remove();
                this.overlay = null;
            }, 300); // 给予过渡动画时间
        }
    }
}

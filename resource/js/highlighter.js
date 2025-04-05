class Highlighter {
    highlight(code) {
        if (!code) return '';
        return code
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '\n');
    }
}

// 创建全局实例
window.Highlighter = new Highlighter();

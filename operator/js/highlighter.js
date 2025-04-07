class Highlighter {
    highlight(code) {
        // 预留接口供后续扩展
        return code;
    }
}

window.Highlighter = new Highlighter();

class Language {
    constructor(parser) {
        this.parser = parser;
    }

    static fromExtension(extension) {
        switch(extension) {
            case 'cpp':
            case 'h':
            case 'hpp':
                return new Language(new CppParser());
            default:
                return null;
        }
    }

    highlight(code) {
        try {
            console.log('开始高亮处理:', code);
            const result = this.parser.highlight(code);
            console.log('高亮结果:', result);
            return result;
        } catch (e) {
            console.error('高亮处理错误:', e);
            return code;
        }
    }
}

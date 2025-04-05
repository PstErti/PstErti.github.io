class CppParser extends LanguageParser {
    constructor() {
        super('cpp');
    }

    parse(code) {
        return code;
    }
}

window.CppParser = new CppParser();

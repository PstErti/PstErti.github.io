class CppParser {
    constructor() {
        this.tokens = [];
        this.symbols = {
            types: new Map(),      // 类型名 -> {kind: 'class'|'struct', pos: 定义位置}
            functions: new Map(),   // 函数名 -> {returnType, pos: 定义位置}
            variables: new Map()    // 变量名 -> {type, pos: 定义位置}
        };
        this.config = CppParser.getConfig();
    }

    static getConfig() {
        return {
            keywords: [
                'auto', 'break', 'case', 'char', 'const', 'continue', 'default', 'do',
                'double', 'else', 'enum', 'extern', 'float', 'for', 'goto', 'if',
                'int', 'long', 'register', 'return', 'short', 'signed', 'sizeof', 'static',
                'struct', 'switch', 'typedef', 'union', 'unsigned', 'void', 'volatile', 'while',
                'bool', 'catch', 'class', 'const_cast', 'delete', 'dynamic_cast', 'explicit',
                'export', 'false', 'friend', 'inline', 'mutable', 'namespace', 'new', 'noexcept',
                'nullptr', 'operator', 'override', 'private', 'protected', 'public', 'reinterpret_cast',
                'static_cast', 'template', 'this', 'throw', 'true', 'try', 'typeid', 'typename',
                'using', 'virtual', 'final'
            ],
            controlKeywords: [
                'return', 'if', 'else', 'for', 'while', 'do',
                'break', 'continue', 'switch', 'case', 'default',
                'try', 'catch', 'throw'
            ],
            basicTypes: [
                'void', 'bool', 'char', 'int', 'float', 'double',
                'short', 'long', 'unsigned', 'signed'
            ],
            stlTypes: [
                'string', 'array', 'vector', 'deque', 'list', 'forward_list',
                'set', 'multiset', 'map', 'multimap', 'unordered_set', 'unordered_multiset',
                'unordered_map', 'unordered_multimap', 'stack', 'queue', 'priority_queue',
                'unique_ptr', 'shared_ptr', 'weak_ptr',
                'pair', 'tuple', 'basic_string', 'stringstream', 'iostream', 'fstream'
            ],
            preprocessors: [
                '#include', '#define', '#undef', '#ifdef', '#ifndef', '#if', '#else',
                '#elif', '#endif', '#line', '#error', '#pragma', '#using'
            ]
        };
    }

    tokenize(code) {
        const tokenDefs = [
            // 预处理指令 - 修改以捕获尖括号内容
            { type: 'preprocessor', regex: /^#[^\n]*?(?:<[^>]*>|\s+\S+)?[^\n]*/ },
            { type: 'whitespace', regex: /^[\s\t\n\r]+/ },
            { type: 'comment', regex: /^\/\/[^\n]*|^\/\*[\s\S]*?\*\// },
            { type: 'string', regex: /^"(?:\\.|[^"\\])*"/ },
            { type: 'char', regex: /^'(?:\\.|[^'\\])'/ },
            { type: 'number', regex: /^(?:\d+\.\d*|\.\d+|\d+)(?:[eE][+-]?\d+)?[fFlL]?|\b0[xX][0-9a-fA-F]+\b/ },
            { type: 'identifier', regex: /^[a-zA-Z_]\w*/ },
            { type: 'operator', regex: /^(?:->|::|\+\+|--|<<|>>|<=|>=|==|!=|&&|\|\||[+\-*\/%&|^!~<>=;,\.\[\]\(\)\{\}?:])+/ }
        ];

        const tokens = [];
        let pos = 0;

        while (pos < code.length) {
            let matched = false;
            for (const def of tokenDefs) {
                const match = code.slice(pos).match(def.regex);
                if (match) {
                    tokens.push({ type: def.type, value: match[0], pos });
                    pos += match[0].length;
                    matched = true;
                    break;
                }
            }
            if (!matched) pos++;
        }

        return tokens;
    }

    parse(code) {
        console.group('解析代码:', code);
        this.tokens = this.tokenize(code);
        this.scanDeclarations();
        console.log('符号表:', {
            types: Array.from(this.symbols.types.entries()),
            functions: Array.from(this.symbols.functions.entries()),
            variables: Array.from(this.symbols.variables.entries())
        });
        console.groupEnd();
        return this.tokens;
    }

    scanDeclarations() {
        let currentScope = '';
        let lastTypeKeyword = null;  // 记录最后看到的类型关键字

        for (let i = 0; i < this.tokens.length; i++) {
            const token = this.tokens[i];
            if (token.type !== 'identifier') {
                // 如果遇到class或struct关键字，记录它
                if (token.value === 'class' || token.value === 'struct') {
                    lastTypeKeyword = token.value;
                }
                continue;
            }

            // 如果前一个token是class或struct，这个标识符是类型名
            if (lastTypeKeyword) {
                console.log('发现类型定义:', token.value);
                this.symbols.types.set(token.value, {
                    kind: lastTypeKeyword,
                    scope: currentScope,
                    pos: token.pos
                });
                lastTypeKeyword = null;  // 重置标记
                continue;
            }

            // 检查前后文上下文
            const prevToken = i > 0 ? this.tokens[i - 1] : null;
            const nextToken = i < this.tokens.length - 1 ? this.tokens[i + 1] : null;

            // 类型定义检查（class/struct）
            if (prevToken && ['class', 'struct'].includes(prevToken.value)) {
                console.log('发现类型定义:', token.value);
                this.symbols.types.set(token.value, {
                    kind: prevToken.value,
                    scope: currentScope,
                    pos: token.pos
                });
                continue;
            }

            // 函数定义检查
            if (nextToken && nextToken.value === '(' && prevToken) {
                const context = this.analyzeContext(i);
                if (context.isFunction) {
                    console.log('发现函数定义:', token.value);
                    this.symbols.functions.set(token.value, {
                        returnType: context.returnType,
                        scope: currentScope,
                        pos: token.pos
                    });
                }
                continue;
            }

            // 变量定义检查
            if (prevToken && this.isTypeSpecifier(prevToken.value)) {
                const context = this.analyzeContext(i);
                if (context.isVariable) {
                    console.log('发现变量定义:', token.value);
                    this.symbols.variables.set(token.value, {
                        type: prevToken.value,
                        scope: currentScope,
                        pos: token.pos
                    });
                }
            }
        }

        console.groupEnd();
    }

    isFunctionDefinition(index) {
        const nextTokens = this.getNextTokens(index, 2);
        return nextTokens[0]?.value === '(' && 
               this.isTypeSpecifier(this.tokens[index - 1]?.value);
    }

    isVariableDefinition(index) {
        const prevToken = this.tokens[index - 1];
        const nextToken = this.tokens[index + 1];
        return this.isTypeSpecifier(prevToken?.value) && 
               ['=', ';', '['].includes(nextToken?.value);
    }

    isTypeSpecifier(value) {
        const basicTypes = ['void', 'int', 'char', 'bool', 'float', 'double', 'auto'];
        return basicTypes.includes(value) || 
               this.symbols.types.has(value);
    }

    getNextTokens(index, count) {
        let tokens = [];
        let i = index + 1;
        let skipNext = false;

        while (tokens.length < count && i < this.tokens.length) {
            const token = this.tokens[i];
            if (skipNext) {
                skipNext = false;
                i++;
                continue;
            }

            if (token.type === 'operator' && token.value === '::') {
                skipNext = true;
            } else {
                tokens.push(token);
            }
            i++;
        }

        return tokens;
    }

    resolveIdentifier(name, currentIndex) {
        const nextTokens = this.getNextTokens(currentIndex, 3);
        const prevToken = this.tokens[currentIndex - 1];

        // 检查是否是函数调用
        const isFunctionCall = nextTokens[0]?.value === '(' || 
                             nextTokens.some(t => t?.value === '(' || t?.value === '()');

        if (isFunctionCall) {
            return { kind: 'function', name };
        }

        // 如果不是函数调用，优先检查是否为已知类型
        if (this.symbols.types.has(name)) {
            const typeInfo = this.symbols.types.get(name);
            return { kind: 'type', subKind: typeInfo.kind, name };
        }

        // 其他类型检查
        if (this.symbols.variables.has(name)) {
            return { kind: 'variable', name };
        }

        return { kind: 'unknown', name };
    }

    getReturnType(index) {
        return this.tokens[index - 1]?.value || 'void';
    }

    getVariableType(index) {
        return this.tokens[index - 1]?.value || 'auto';
    }

    highlight(code) {
        this.parse(code);
        let highlighted = '';

        this.tokens.forEach(token => {
            highlighted += this.highlightToken(token);
        });

        return highlighted;
    }

    highlightToken(token) {
        console.log('处理token:', token);
        switch (token.type) {
            case 'preprocessor': {
                // 分别处理预处理指令和include路径
                const includeMatch = token.value.match(/^(#\s*include\s*)(<[^>]+>|"[^"]+")(.*)$/);
                if (includeMatch) {
                    return `<span class="preprocessor">${includeMatch[1]}</span>` +
                           `<span class="string">${includeMatch[2]}</span>` +
                           (includeMatch[3] ? `<span class="comment">${includeMatch[3]}</span>` : '');
                }
                // 处理其他预处理指令
                const parts = token.value.split(/\s+/);
                return `<span class="preprocessor">${parts[0]}</span>` +
                       (parts.length > 1 ? ' ' + parts.slice(1).join(' ') : '');
            }
            case 'identifier': {
                const currentIndex = this.tokens.indexOf(token);
                return this.highlightIdentifier(token.value, currentIndex);
            }
            case 'string':
            case 'number':
            case 'operator':
            case 'comment':
            case 'whitespace':
                return `<span class="${token.type}">${token.value}</span>`;
            default:
                return token.value;
        }
    }

    highlightIdentifier(value, currentIndex) {
        // 先检查是否是关键字
        if (this.config.controlKeywords.includes(value)) {
            return `<span class="control">${value}</span>`;
        }
        if (value === 'class' || value === 'struct') {
            return `<span class="keyword">${value}</span>`;
        }
        if (this.config.keywords.includes(value)) {
            return `<span class="keyword">${value}</span>`;
        }
        if (this.config.basicTypes.includes(value)) {
            return `<span class="type">${value}</span>`;
        }
        if (this.config.stlTypes.includes(value)) {
            return `<span class="type">${value}</span>`;
        }
        if (value === 'std') {
            return `<span class="namespace">${value}</span>`;
        }

        // 解析标识符
        const symbolInfo = this.resolveIdentifier(value, currentIndex);
        return this.highlightSymbol(value, symbolInfo);
    }

    highlightSymbol(name, info) {
        switch (info.kind) {
            case 'function':
                return `<span class="user-function">${name}</span>`;  // 任何带括号的标识符都用函数样式
            case 'type':
                return `<span class="user-class">${name}</span>`;
            case 'variable':
                return `<span class="user-variable">${name}</span>`;
            default:
                return name;
        }
    }

    analyzeContext(index) {
        const prevTokens = this.tokens.slice(Math.max(0, index - 3), index);
        const nextTokens = this.tokens.slice(index + 1, index + 4);
        
        return {
            isFunction: nextTokens[0]?.value === '(',
            isVariable: nextTokens[0]?.value === ';' || nextTokens[0]?.value === '=' || nextTokens[0]?.value === '[',
            returnType: prevTokens[prevTokens.length - 1]?.value || 'auto'
        };
    }
}

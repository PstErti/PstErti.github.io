const themes = {
    dark: {
        comment: '#6A9955',    // 绿色
        keyword: '#569CD6',    // 蓝色
        string: '#CE9178',     // 橙色
        function: '#DCDCAA',   // 浅黄色
        functionDefinition: '#DCDCAA',  // 浅黄色
        variableDefinition: '#9CDCFE',  // 浅蓝色
        number: '#CE9178',     // 黄色，与字符串相同
        operator: '#D4D4D4',   // 白色
        preprocessor: '#569CD6',// 蓝色
        type: '#4EC9B0',       // 青色
        background: '#1e1e1e', // 深色背景
        foreground: '#d4d4d4', // 默认文本
        control: '#C586C0',    // 粉紫色
        namespace: '#4EC9B0',  // 与type相同颜色
        userClass: '#4EC9B0',      // 用户定义的类，绿色
        userVariable: '#9CDCFE',    // 用户定义的变量，天蓝色
        userFunction: '#DCDCAA',    // 用户定义的函数，黄色
        titleBar: '#3c3c3c',      // 代码框标题栏背景色
        menuText: '#9e9e9e',      // 菜单文字颜色
        menuHover: '#4d4d4d',     // 菜单hover背景色
        headerBg: 'rgba(30, 30, 30, 0.95)',  // 页眉背景色
        headerText: '#d4d4d4',    // 页眉文字颜色
        headerHover: '#ffffff',    // 页眉hover文字颜色
        accentColor: '#569CD6',   // 强调色（用于logo渐变、下划线等）
        accentColor2: '#4EC9B0',  // 第二强调色（用于logo渐变）
        menuDropdownBg: '#2d2d2d',    // 下拉菜单背景色
        menuDropdownShadow: 'rgba(0, 0, 0, 0.3)',  // 下拉菜单阴影
        menuOptionHover: '#4d4d4d',    // 选项悬停背景色
    },
    light: {
        comment: '#008000',    // 绿色
        keyword: '#0000FF',    // 蓝色
        string: '#A31515',     // 红色
        function: '#795E26',   // 棕色
        functionDefinition: '#795E26',  // 棕色
        variableDefinition: '#001080',  // 深蓝色
        number: '#795E26',     // 黄色，与函数相同
        operator: '#000000',   // 黑色
        preprocessor: '#0000FF',// 蓝色
        type: '#267F99',       // 青色
        background: '#ffffff', // 白色背景
        foreground: '#000000', // 默认文本
        control: '#AF00DB',    // 粉紫色
        namespace: '#267F99',  // 与type相同颜色
        userClass: '#267F99',       // 用户定义的类
        userVariable: '#001080',    // 用户定义的变量
        userFunction: '#795E26',    // 用户定义的函数
        titleBar: '#f3f3f3',      // 浅色标题栏
        menuText: '#616161',      // 浅色菜单文字
        menuHover: '#e0e0e0',     // 浅色菜单hover背景
        headerBg: 'rgba(255, 255, 255, 0.95)', // 浅色页眉背景
        headerText: '#424242',    // 浅色页眉文字
        headerHover: '#000000',   // 浅色页眉hover文字
        accentColor: '#0078d4',   // 浅色主题强调色
        accentColor2: '#267F99',  // 浅色主题第二强调色
        menuDropdownBg: '#ffffff',     // 亮色下拉菜单背景
        menuDropdownShadow: 'rgba(0, 0, 0, 0.1)',  // 亮色菜单阴影
        menuOptionHover: '#f5f5f5',    // 亮色选项悬停背景
    }
};

// 获取当前主题的颜色
function getThemeColors(themeName = 'dark') {
    return themes[themeName] || themes.dark;
}

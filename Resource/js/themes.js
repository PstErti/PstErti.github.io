const ThemeManager = {
    themes: {
        dark: {
            background: '#1e1e1e',
            foreground: '#d4d4d4',
            comment: '#6A9955',
            keyword: '#569CD6',
            string: '#CE9178',
            number: '#B5CEA8',
            type: '#4EC9B0',
            function: '#DCDCAA',
            operator: '#D4D4D4',
            variable: '#9CDCFE',
            headerBg: 'rgba(30, 30, 30, 0.8)',
            headerText: '#d4d4d4',
            headerHover: '#569CD6',
            menuText: '#d4d4d4',
            menuHover: '#2d2d2d',
            menuOptionHover: '#3d3d3d',
            menuDropdownBg: '#2d2d2d',
            menuDropdownShadow: 'rgba(0, 0, 0, 0.3)',
            titleBar: '#2d2d2d',
            accentColor: '#569CD6',
            accentColor2: '#4EC9B0'
        },
        light: {
            background: '#ffffff',
            foreground: '#1e1e1e',
            comment: '#008000',
            keyword: '#0000ff',
            string: '#a31515',
            number: '#098658',
            type: '#267f99',
            function: '#795E26',
            operator: '#000000',
            variable: '#001080',
            headerBg: 'rgba(255, 255, 255, 0.8)',
            headerText: '#1e1e1e',
            headerHover: '#0000ff',
            menuText: '#1e1e1e',
            menuHover: '#f0f0f0',
            menuOptionHover: '#e0e0e0',
            menuDropdownBg: '#ffffff',
            menuDropdownShadow: 'rgba(0, 0, 0, 0.1)',
            titleBar: '#f3f3f3',
            accentColor: '#0000ff',
            accentColor2: '#267f99'
        }
    },

    getTheme(themeName) {
        return this.themes[themeName] || this.themes.dark;
    }
};

window.ThemeManager = ThemeManager;

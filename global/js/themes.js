const ThemeManager = {
    themes: {
        dark: {
            background: '#1e1e1e',
            foreBackground: '#2d2d2d',
            foreground: '#d4d4d4',
            headerBg: 'rgba(30, 30, 30, 0.8)',
            headerText: '#d4d4d4',
            headerHover: '#569CD6',
            menuText: '#d4d4d4',
            menuHover: '#2d2d2d',
            menuOptionHover: '#3d3d3d',
            menuDropdownBg: '#2d2d2d',
            menuDropdownShadow: 'rgba(0, 0, 0, 0.3)',
            accentColor: '#569CD6',
            accentColor2: '#9CDCFE',
            logoTint: 'invert(23%) sepia(80%) saturate(1900%) hue-rotate(190deg) brightness(90%)',  // 深蓝色
            link: '#3794ff',    
            linkHover: '#0078d4'  
        },
        light: {
            background: '#f5f5f5',
            foreBackground: '#ffffff',
            foreground: '#1e1e1e',
            headerBg: 'rgba(255, 255, 255, 0.8)',
            headerText: '#1e1e1e',
            headerHover: '#0000aa',
            menuText: '#1e1e1e',
            menuHover: '#f0f0f0',
            menuOptionHover: '#e0e0e0',
            menuDropdownBg: '#ffffff',
            menuDropdownShadow: 'rgba(0, 0, 0, 0.1)',
            accentColor: '#0078D4',
            accentColor2: '#28A8EA',
            logoTint: 'invert(70%) sepia(20%) saturate(1800%) hue-rotate(177deg) brightness(102%)',  // 浅蓝色
            link: '#0078d4',     
            linkHover: '#3794ff' 
        }
    },

    getTheme(themeName) {
        return this.themes[themeName] || this.themes.dark;
    }
};

window.ThemeManager = ThemeManager;

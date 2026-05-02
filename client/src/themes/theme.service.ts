import { Injectable } from '@angular/core';
import { APP_THEMES, DEFAULT_APP_THEME } from './app-themes';
import { MAIN_THEMES, DEFAULT_MAIN_THEME } from './main-themes';
import { Theme } from './theme.dto';

@Injectable({ providedIn: 'root' })
export class ThemeService {

  themes = APP_THEMES;
  mainThemes = MAIN_THEMES;

  defaultAppTheme = DEFAULT_APP_THEME;
  defaultMainTheme = DEFAULT_MAIN_THEME;

  applyTheme(theme: Theme) {
    const root = document.documentElement;
    root.style.setProperty('--color-primary', theme.colors.primary);
    root.style.setProperty('--color-secondary', theme.colors.secondary);
    root.style.setProperty('--color-accent', theme.colors.elements);
    root.style.setProperty('--color-text', theme.colors.text);
  }

  applyMainTheme(mode: 'light' | 'dark', applyTheme: Theme) {
    const root = document.documentElement;
    const theme = this.mainThemes[mode];
    if (!theme) return;
    root.style.setProperty('--main-main', theme.colors.main);
    if (mode == 'light') {
      root.style.setProperty('--main-primary', applyTheme.colors.secondary);
      root.style.setProperty('--main-secondary', applyTheme.colors.elements);
    }
    else {
      root.style.setProperty('--main-primary', theme.colors.primary);
      root.style.setProperty('--main-secondary', theme.colors.secondary);
    }

    root.style.setProperty('--main-text', theme.colors.text);
  }


  applyMiddleTheme(mode: 'light' | 'dark', applyTheme: Theme) {
    const root = document.documentElement;
    const theme = this.mainThemes[mode];
    if (!theme) return;

    if (mode == 'light') {
      root.style.setProperty('--color-main', applyTheme.colors.elements);
    }
    else {
      root.style.setProperty('--color-main', applyTheme.colors.main);
    }
  }

  applyGradientTheme(mode: 'light' | 'dark', applyTheme: Theme) {
    const root = document.documentElement;
    const theme = this.mainThemes[mode];
    if (!theme) return;

    if (mode == 'light') {
      root.style.setProperty(
        '--gradient',
        `linear-gradient(135deg, ${applyTheme.colors.main}, ${applyTheme.colors.primary}, ${applyTheme.colors.secondary})`
      );
    }
    else {
      root.style.setProperty(
        '--gradient',
        `linear-gradient(rgba(0, 0, 0, 0.6),rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), linear-gradient(135deg, ${applyTheme.colors.main}, ${applyTheme.colors.primary}, ${applyTheme.colors.secondary})`
      );
    }
  }

  applyBorderTheme(mode: 'light' | 'dark', applyTheme: Theme) {
    const root = document.documentElement;
    const theme = this.mainThemes[mode];
    if (!theme) return;

    if (mode == 'light') {
      root.style.setProperty(
        '--border-color', `rgb(from ${applyTheme.colors.main} r g b / 0.5)`
      );
    }
    else {
      root.style.setProperty(
        '--border-color', applyTheme.colors.secondary
      );
    }
  }

  init() {
    let savedMainTheme = localStorage.getItem('mainTheme') as 'light' | 'dark';
    let saved = localStorage.getItem('theme');
    savedMainTheme = savedMainTheme || 'light';
    const savedAppTheme = this.themes.find(t => t.name === saved) || this.themes.find(t => t.name === 'blue-modern');
    this.applyTheme(savedAppTheme!);
    this.applyMainTheme(savedMainTheme, savedAppTheme!);
    this.applyMiddleTheme(savedMainTheme, savedAppTheme!)
    this.applyBorderTheme(savedMainTheme, savedAppTheme!)
    this.applyGradientTheme(savedMainTheme, savedAppTheme!)
  }
}
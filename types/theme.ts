export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
    [key: string]: string; // Allow for dynamic color additions
  };
  typography: {
    fontFamily: {
      heading: string;
      body: string;
    };
    fontSize: {
      h1: string;
      h2: string;
      h3: string;
      h4: string;
      h5: string;
      body: string;
      [key: string]: string; // Allow for dynamic size additions
    };
  };
  spacing: {
    container: string;
    section: string;
    [key: string]: string; // Allow for dynamic spacing additions
  };
}

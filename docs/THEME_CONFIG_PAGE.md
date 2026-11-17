# Theme Configuration Page

## Overview

The Theme Configuration Page (`/theme-config`) is a visual interface for customizing your application's theme including colors, typography, and button styles. Changes are saved directly to the backend API, which updates environment variables.

## Access

Navigate to `/theme-config` in your application.

## Features

### 1. **Colors Tab**
Configure all application colors for both Light and Dark modes:

- **Brand Colors** - Primary color, CTA hover, accent color
- **Backgrounds** - Primary, secondary, cards/containers
- **Text Colors** - Primary and secondary text
- **State Colors** - Success, warning, error states
- **Borders & Dividers** - Border and divider colors
- **Icon Colors** - Primary and hover/active icon colors
- **Special Values** - White and black references
- **Opacity Colors** - Colors with transparency
- **Freebie Colors** - Freebies background and tag colors
- **Product Offer Colors** - Gradient colors for product offers
- **Rating Colors** - Colors for rating components

### 2. **Typography Tab**
Configure font settings:

- **Font Family** - Base font family
- **Base Font Size** - Root font size
- **Font Weights** - Light, Regular, Medium, SemiBold, Bold, ExtraBold
- **Font Sizes** - H1-H6, Small, XSS, Description

### 3. **Buttons Tab**
Configure button styles for Light and Dark modes:

- **Primary Buttons** - Background, text, hover states, borders, font size
- **Secondary Buttons** - Background, text, hover states, borders, font size

### 4. **Preview Tab**
See live preview of your theme changes across all components.

## How It Works

### Save Flow

```
1. User modifies theme settings in UI
2. Click "Save to API" button
3. Configuration sent to backend API
4. Backend updates environment variables
5. JSON file downloaded as backup
6. Success notification shown
```

### Data Persistence

- **Backend API**: Updates environment variables (single source of truth)
- **No localStorage**: Not used - environment variables are authoritative
- **JSON Download**: Backup/reference only

### API Integration

**Endpoint:**
```
PATCH /e-commerce/v1/tenant/global-config
```

**Headers:**
```
Authorization: Bearer {token}
Tenant-Id: {tenantId}
Content-Type: application/json
```

**Payload Format:**
```json
{
  "fontFamily": "Arial",
  "baseFontSize": "16px",
  "fontSizes": { ... },
  "buttonStyles": {
    "light": { "primary": {...}, "secondary": {...} },
    "dark": { "primary": {...}, "secondary": {...} }
  },
  "themeColors": {
    "light": {
      "primaryColor": "#F2C94C",
      "freebiesBg": "#E1F0D9",
      "freebieTag": "#66BB6A",
      "productOfferBgStart": "#E6FFE7",
      "productOfferBgEnd": "#FFFFFF",
      ...
    },
    "dark": { ... }
  },
  "fontWeights": {
    "light": 300,
    "regular": 400,
    ...
  }
}
```

## New Color Fields

### Freebie Colors

**Light Mode:**
- Freebies Background: `#E1F0D9`
- Freebie Tag: `#66BB6A`

**Dark Mode:**
- Freebies Background: `#0F2A01`
- Freebie Tag: `#66BB6A`

**Usage in Components:**
```tsx
<div style={{ backgroundColor: 'var(--freebies-bg)' }}>
  <span style={{ color: 'var(--freebie-tag)' }}>FREE</span>
</div>
```

### Product Offer Colors

**Light Mode:**
- Product Offer Start: `#E6FFE7`
- Product Offer End: `#FFFFFF`

**Dark Mode:**
- Product Offer Start: `#003402`
- Product Offer End: `#212121`

**Usage in Components:**
```tsx
<div style={{ 
  background: `linear-gradient(to right, 
    var(--product-offer-bg-start), 
    var(--product-offer-bg-end))` 
}}>
  Special Offer
</div>
```

## Environment Variables

The system reads from these environment variables:

### Freebie Colors
```bash
# Light Mode
NEXT_PUBLIC_FREEBIES_BG_LIGHT=#E1F0D9
NEXT_PUBLIC_FREEBIE_TAG_LIGHT=#66BB6A

# Dark Mode
NEXT_PUBLIC_FREEBIES_BG_DARK=#0F2A01
NEXT_PUBLIC_FREEBIE_TAG_DARK=#66BB6A
```

### Product Offer Colors
```bash
# Light Mode
NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_START=#E6FFE7
NEXT_PUBLIC_PRODUCT_OFFER_BG_LIGHT_END=#FFFFFF

# Dark Mode
NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_START=#003402
NEXT_PUBLIC_PRODUCT_OFFER_BG_DARK_END=#212121
```

## Programmatic Usage

### Save Theme Configuration

```typescript
import { saveThemeConfig } from '@services/themeConfigService';
import { ThemeConfig } from 'types/themeConfig.types';

const config: ThemeConfig = {
  // your configuration
};

const result = await saveThemeConfig(config);

if (result.success) {
  console.log('Theme saved successfully');
} else {
  console.error('Error:', result.error);
}
```

### Fetch Theme Configuration

```typescript
import { fetchThemeConfig } from '@services/themeConfigService';

const result = await fetchThemeConfig();

if (result.success) {
  const config = result.data;
  // use configuration
}
```

## UI Features

- **Mode Toggle**: Switch between Light and Dark modes
- **Live Preview**: See changes in real-time
- **Color Pickers**: Visual color selection
- **Reset to Defaults**: Reset individual fields or entire theme
- **Theme Presets**: Apply pre-configured themes
- **Resizable Panels**: Adjust preview/editor panel sizes
- **Collapsible Sections**: Organize settings into logical groups

## Important Notes

1. **Environment Variables**: The backend API updates environment variables, which are the single source of truth
2. **Application Restart**: Depending on your deployment setup, you may need to restart the application for changes to take effect
3. **Mode-Specific Colors**: Most colors are mode-specific (Light/Dark), configure both for consistency
4. **Gradients**: Product offer colors create gradients - use complementary colors for best results

## Troubleshooting

### Changes Not Applying
- Check browser console for API errors
- Verify backend API response
- May need to restart application for env var changes

### API Call Fails
- Check authentication token
- Verify Tenant-Id header is set correctly
- Check network tab for request details

### Colors Not Showing
- Verify CSS variable names match theme config
- Check that component uses CSS variables (e.g., `var(--primary-color)`)
- Ensure correct mode (Light/Dark) is active

## Architecture

### Files Structure

```
services/
  └── themeConfigService.ts       # API integration service

app/theme-config/
  ├── page.tsx                    # Main page component
  ├── context/
  │   └── ThemeConfigContext.tsx  # State management
  └── components/
      ├── ColorsTab.tsx           # Colors configuration
      ├── TypographyTab.tsx       # Typography configuration
      ├── ButtonsTab.tsx          # Buttons configuration
      └── PreviewPanel.tsx        # Live preview

lib/theme/
  ├── defaultThemeConfig.ts       # Default values
  ├── jsonConfigGenerator.ts      # ENV var export
  └── themePresets.ts             # Pre-configured themes

types/
  └── themeConfig.types.ts        # TypeScript types
```

### Data Flow

```
UI Component
    ↓
ThemeConfigContext (state)
    ↓
themeConfigService (API layer)
    ↓
axiosClient (HTTP)
    ↓
Backend API
    ↓
Environment Variables (updated)
```

## Summary

The Theme Configuration Page provides a user-friendly interface to customize your application's appearance. Changes are persisted through the backend API which updates environment variables, ensuring consistent theming across your entire application. The new freebie and product offer color fields allow for targeted styling of promotional elements.

---

**Last Updated:** December 8, 2025


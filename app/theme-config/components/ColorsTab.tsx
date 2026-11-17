"use client";

import React from 'react';
import { CollapsibleSection } from './CollapsibleSection';
import { ColorPickerField } from './ColorPickerField';
import { ModeToggle } from './ModeToggle';
import { useThemeConfig } from '../context/ThemeConfigContext';

export function ColorsTab() {
  const { config, mode, setMode, updateColor, updateRatingColor, resetColor, resetRatingColor } = useThemeConfig();
  const colors = config.themeColors[mode];

  const handleColorChange = (path: string, value: string) => {
    updateColor(mode, path, value);
  };

  const handleRatingColorChange = (key: string, value: string) => {
    updateRatingColor(mode, key, value);
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-2xl font-bold" style={{ color: 'var(--primary-text)' }}>
          Color Configuration
        </h2>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      <div className="space-y-3">
        {/* Brand Colors */}
        <CollapsibleSection title="Brand Colors" defaultOpen={true}>
          <ColorPickerField
            label="Primary Color"
            value={colors.primaryColor}
            onChange={(v) => handleColorChange('primaryColor', v)}
            onReset={() => resetColor(mode, 'primaryColor')}
            envVariable={`NEXT_PUBLIC_PRIMARY_COLOR_${mode.toUpperCase()}`}
            description="Main brand color used throughout the application"
          />
          <ColorPickerField
            label="CTA Hover"
            value={colors.ctaHover}
            onChange={(v) => handleColorChange('ctaHover', v)}
            onReset={() => resetColor(mode, 'ctaHover')}
            envVariable={`NEXT_PUBLIC_CTA_HOVER_${mode.toUpperCase()}`}
            description="Hover state for call-to-action elements"
          />
          <ColorPickerField
            label="Accent Color"
            value={colors.accentColor}
            onChange={(v) => handleColorChange('accentColor', v)}
            onReset={() => resetColor(mode, 'accentColor')}
            envVariable={`NEXT_PUBLIC_ACCENT_COLOR_${mode.toUpperCase()}`}
            description="Secondary accent color for highlights"
          />
        </CollapsibleSection>

        {/* Backgrounds */}
        <CollapsibleSection title="Backgrounds">
          <ColorPickerField
            label="Primary Background"
            value={colors.primaryBackground}
            onChange={(v) => handleColorChange('primaryBackground', v)}
            onReset={() => resetColor(mode, 'primaryBackground')}
            envVariable={`NEXT_PUBLIC_PRIMARY_BACKGROUND_${mode.toUpperCase()}`}
            description="Main background color"
          />
          <ColorPickerField
            label="Secondary Background"
            value={colors.secondaryBackground}
            onChange={(v) => handleColorChange('secondaryBackground', v)}
            onReset={() => resetColor(mode, 'secondaryBackground')}
            envVariable={`NEXT_PUBLIC_SECONDARY_BACKGROUND_${mode.toUpperCase()}`}
            description="Alternative background color"
          />
          <ColorPickerField
            label="Cards/Containers"
            value={colors.cardsContainers}
            onChange={(v) => handleColorChange('cardsContainers', v)}
            onReset={() => resetColor(mode, 'cardsContainers')}
            envVariable={`NEXT_PUBLIC_CARDS_CONTAINERS_${mode.toUpperCase()}`}
            description="Background for cards and containers"
          />
          <ColorPickerField
            label="Tertiary Active Background"
            value={colors.tertiaryActiveBackground}
            onChange={(v) => handleColorChange('tertiaryActiveBackground', v)}
            onReset={() => resetColor(mode, 'tertiaryActiveBackground')}
            envVariable={`NEXT_PUBLIC_TERTIARY_ACTIVE_BACKGROUND_${mode.toUpperCase()}`}
            description="Background for tertiary active states (5% opacity)"
          />
          <ColorPickerField
            label="Secondary Active Background"
            value={colors.secondaryActiveBackground}
            onChange={(v) => handleColorChange('secondaryActiveBackground', v)}
            onReset={() => resetColor(mode, 'secondaryActiveBackground')}
            envVariable={`NEXT_PUBLIC_SECONDARY_ACTIVE_BACKGROUND_${mode.toUpperCase()}`}
            description="Background for secondary active states (10% opacity)"
          />
          <ColorPickerField
            label="Button Active Background"
            value={colors.buttonActiveBg}
            onChange={(v) => handleColorChange('buttonActiveBg', v)}
            onReset={() => resetColor(mode, 'buttonActiveBg')}
            envVariable={`NEXT_PUBLIC_BUTTON_ACTIVE_BG_${mode.toUpperCase()}`}
            description="Active state background for buttons (20% opacity)"
          />
          <ColorPickerField
            label="Order Status Bar"
            value={colors.orderStatusBar}
            onChange={(v) => handleColorChange('orderStatusBar', v)}
            onReset={() => resetColor(mode, 'orderStatusBar')}
            envVariable={`NEXT_PUBLIC_ORDER_STATUS_BAR_${mode.toUpperCase()}`}
            description="Background for order status indicators"
          />
        </CollapsibleSection>

        {/* Text Colors */}
        <CollapsibleSection title="Text Colors">
          <ColorPickerField
            label="Primary Text"
            value={colors.primaryText}
            onChange={(v) => handleColorChange('primaryText', v)}
            onReset={() => resetColor(mode, 'primaryText')}
            envVariable={`NEXT_PUBLIC_PRIMARY_TEXT_${mode.toUpperCase()}`}
            description="Main text color"
          />
          <ColorPickerField
            label="Secondary Text"
            value={colors.secondaryText}
            onChange={(v) => handleColorChange('secondaryText', v)}
            onReset={() => resetColor(mode, 'secondaryText')}
            envVariable={`NEXT_PUBLIC_SECONDARY_TEXT_${mode.toUpperCase()}`}
            description="Secondary/muted text color"
          />
        </CollapsibleSection>

        {/* State Colors */}
        <CollapsibleSection title="State Colors">
          <ColorPickerField
            label="Success"
            value={colors.success}
            onChange={(v) => handleColorChange('success', v)}
            onReset={() => resetColor(mode, 'success')}
            envVariable={`NEXT_PUBLIC_SUCCESS_${mode.toUpperCase()}`}
            description="Success state color"
          />
          <ColorPickerField
            label="Warning"
            value={colors.warning}
            onChange={(v) => handleColorChange('warning', v)}
            onReset={() => resetColor(mode, 'warning')}
            envVariable={`NEXT_PUBLIC_WARNING_${mode.toUpperCase()}`}
            description="Warning state color"
          />
          <ColorPickerField
            label="Warning with Opacity"
            value={colors.warningWithOpacity}
            onChange={(v) => handleColorChange('warningWithOpacity', v)}
            onReset={() => resetColor(mode, 'warningWithOpacity')}
            envVariable={`NEXT_PUBLIC_WARNING_WITH_OPACITY_${mode.toUpperCase()}`}
            description="Warning color with 13% opacity"
          />
          <ColorPickerField
            label="Error"
            value={colors.error}
            onChange={(v) => handleColorChange('error', v)}
            onReset={() => resetColor(mode, 'error')}
            envVariable={`NEXT_PUBLIC_ERROR_${mode.toUpperCase()}`}
            description="Error state color"
          />
        </CollapsibleSection>

        {/* Borders & Dividers */}
        <CollapsibleSection title="Borders & Dividers">
          <ColorPickerField
            label="Borders/Dividers"
            value={colors.bordersDividers}
            onChange={(v) => handleColorChange('bordersDividers', v)}
            onReset={() => resetColor(mode, 'bordersDividers')}
            envVariable={`NEXT_PUBLIC_BORDERS_DIVIDERS_${mode.toUpperCase()}`}
            description="General border and divider color"
          />
          <ColorPickerField
            label="Borders"
            value={colors.borders}
            onChange={(v) => handleColorChange('borders', v)}
            onReset={() => resetColor(mode, 'borders')}
            envVariable={`NEXT_PUBLIC_BORDERS_${mode.toUpperCase()}`}
            description="Border color"
          />
          <ColorPickerField
            label="Inner Alignment Border"
            value={colors.innerAlignmentBorder}
            onChange={(v) => handleColorChange('innerAlignmentBorder', v)}
            onReset={() => resetColor(mode, 'innerAlignmentBorder')}
            envVariable={`NEXT_PUBLIC_INNER_ALLIGNMENT_BORDER_${mode.toUpperCase()}`}
            description="Border color for inner alignment"
          />
          <ColorPickerField
            label="Tertiary Button Hover Background"
            value={colors.tertiaryButtonHoverBg}
            onChange={(v) => handleColorChange('tertiaryButtonHoverBg', v)}
            onReset={() => resetColor(mode, 'tertiaryButtonHoverBg')}
            envVariable={`NEXT_PUBLIC_TERTIARY_BUTTON_HOVER_BG_${mode.toUpperCase()}`}
            description="Hover background for tertiary buttons"
          />
        </CollapsibleSection>

        {/* Icons */}
        <CollapsibleSection title="Icon Colors">
          <ColorPickerField
            label="Primary Icon Color"
            value={colors.primaryIconColor}
            onChange={(v) => handleColorChange('primaryIconColor', v)}
            onReset={() => resetColor(mode, 'primaryIconColor')}
            envVariable={`NEXT_PUBLIC_PRIMARY_ICON_COLOR_${mode.toUpperCase()}`}
            description="Default icon color"
          />
          <ColorPickerField
            label="Hover/Active Icon Color"
            value={colors.hoverActiveIconColor}
            onChange={(v) => handleColorChange('hoverActiveIconColor', v)}
            onReset={() => resetColor(mode, 'hoverActiveIconColor')}
            envVariable={`NEXT_PUBLIC_HOVER_ACTIVE_ICON_COLOR_${mode.toUpperCase()}`}
            description="Icon color on hover and active states"
          />
        </CollapsibleSection>

        {/* Special Values */}
        <CollapsibleSection title="Special Values">
          <ColorPickerField
            label="White"
            value={colors.white}
            onChange={(v) => handleColorChange('white', v)}
            onReset={() => resetColor(mode, 'white')}
            envVariable={`NEXT_PUBLIC_WHITE_${mode.toUpperCase()}`}
            description="White color reference"
          />
          <ColorPickerField
            label="Black"
            value={colors.black}
            onChange={(v) => handleColorChange('black', v)}
            onReset={() => resetColor(mode, 'black')}
            envVariable={`NEXT_PUBLIC_BLACK_${mode.toUpperCase()}`}
            description="Black color reference"
          />
        </CollapsibleSection>

        {/* Opacity Colors */}
        <CollapsibleSection title="Opacity Colors">
          <div className="mb-4 p-3 rounded-lg" style={{ backgroundColor: 'var(--cards-containers)' }}>
            <p className="text-sm" style={{ color: 'var(--secondary-text)' }}>
              <strong>Note:</strong> These colors include opacity values and can be auto-generated from base colors.
              Customize them here to use specific values.
            </p>
          </div>
          <ColorPickerField
            label="Primary Color with Opacity"
            value={colors.primaryColorOpacity}
            onChange={(v) => handleColorChange('primaryColorOpacity', v)}
            onReset={() => resetColor(mode, 'primaryColorOpacity')}
            envVariable="NEXT_PUBLIC_PRIMARY_COLOR_OPACITY"
            description="Primary color with 40% opacity (shared between modes)"
          />
        </CollapsibleSection>

        {/* Freebie Colors */}
        <CollapsibleSection title="Freebie Colors">
          <ColorPickerField
            label="Freebies Background"
            value={colors.freebiesBg}
            onChange={(v) => handleColorChange('freebiesBg', v)}
            onReset={() => resetColor(mode, 'freebiesBg')}
            envVariable={`NEXT_PUBLIC_FREEBIES_BG_${mode.toUpperCase()}`}
            description="Background color for freebie items"
          />
          <ColorPickerField
            label="Freebie Tag"
            value={colors.freebieTag}
            onChange={(v) => handleColorChange('freebieTag', v)}
            onReset={() => resetColor(mode, 'freebieTag')}
            envVariable={`NEXT_PUBLIC_FREEBIE_TAG_${mode.toUpperCase()}`}
            description="Tag color for freebie labels"
          />
        </CollapsibleSection>

        {/* Product Offer Colors */}
        <CollapsibleSection title="Product Offer Colors">
          <ColorPickerField
            label="Product Offer Background Start"
            value={colors.productOfferBgStart}
            onChange={(v) => handleColorChange('productOfferBgStart', v)}
            onReset={() => resetColor(mode, 'productOfferBgStart')}
            envVariable={`NEXT_PUBLIC_PRODUCT_OFFER_BG_${mode.toUpperCase()}_START`}
            description="Start gradient color for product offers"
          />
          <ColorPickerField
            label="Product Offer Background End"
            value={colors.productOfferBgEnd}
            onChange={(v) => handleColorChange('productOfferBgEnd', v)}
            onReset={() => resetColor(mode, 'productOfferBgEnd')}
            envVariable={`NEXT_PUBLIC_PRODUCT_OFFER_BG_${mode.toUpperCase()}_END`}
            description="End gradient color for product offers"
          />
        </CollapsibleSection>

        {/* Rating Colors */}
        <CollapsibleSection title="Rating Colors">
          <div className="space-y-6">
            {/* Success Colors */}
            <div>
              <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--primary-text)' }}>
                Success Colors
              </h4>
              <ColorPickerField
                label="Success Primary"
                value={colors.ratingColors.bgSuccessPrimaryLight}
                onChange={(v) => handleRatingColorChange('bgSuccessPrimaryLight', v)}
                onReset={() => resetRatingColor(mode, 'bgSuccessPrimaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_LIGHT"
              />
              <ColorPickerField
                label="Success Primary Transparent"
                value={colors.ratingColors.bgSuccessPrimaryTransparent}
                onChange={(v) => handleRatingColorChange('bgSuccessPrimaryTransparent', v)}
                onReset={() => resetRatingColor(mode, 'bgSuccessPrimaryTransparent')}
                envVariable="NEXT_PUBLIC_RATING_BG_SUCCESS_PRIMARY_TRANSPARENT"
                description="With opacity"
              />
              <ColorPickerField
                label="Success Secondary"
                value={colors.ratingColors.bgSuccessSecondaryLight}
                onChange={(v) => handleRatingColorChange('bgSuccessSecondaryLight', v)}
                onReset={() => resetRatingColor(mode, 'bgSuccessSecondaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BG_SUCCESS_SECONDARY_LIGHT"
              />
            </div>

            {/* Warning Colors */}
            <div>
              <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--primary-text)' }}>
                Warning Colors
              </h4>
              <ColorPickerField
                label="Warning Primary"
                value={colors.ratingColors.bgWarningPrimaryLight}
                onChange={(v) => handleRatingColorChange('bgWarningPrimaryLight', v)}
                onReset={() => resetRatingColor(mode, 'bgWarningPrimaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_LIGHT"
              />
              <ColorPickerField
                label="Warning Primary Transparent"
                value={colors.ratingColors.bgWarningPrimaryTransparent}
                onChange={(v) => handleRatingColorChange('bgWarningPrimaryTransparent', v)}
                onReset={() => resetRatingColor(mode, 'bgWarningPrimaryTransparent')}
                envVariable="NEXT_PUBLIC_RATING_BG_WARNING_PRIMARY_TRANSPARENT"
                description="With opacity"
              />
              <ColorPickerField
                label="Warning Secondary"
                value={colors.ratingColors.bgWarningSecondaryLight}
                onChange={(v) => handleRatingColorChange('bgWarningSecondaryLight', v)}
                onReset={() => resetRatingColor(mode, 'bgWarningSecondaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BG_WARNING_SECONDARY_LIGHT"
              />
            </div>

            {/* Error Colors */}
            <div>
              <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--primary-text)' }}>
                Error Colors
              </h4>
              <ColorPickerField
                label="Error Primary"
                value={colors.ratingColors.bgErrorPrimaryLight}
                onChange={(v) => handleRatingColorChange('bgErrorPrimaryLight', v)}
                onReset={() => resetRatingColor(mode, 'bgErrorPrimaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_LIGHT"
              />
              <ColorPickerField
                label="Error Primary Transparent"
                value={colors.ratingColors.bgErrorPrimaryTransparent}
                onChange={(v) => handleRatingColorChange('bgErrorPrimaryTransparent', v)}
                onReset={() => resetRatingColor(mode, 'bgErrorPrimaryTransparent')}
                envVariable="NEXT_PUBLIC_RATING_BG_ERROR_PRIMARY_TRANSPARENT"
                description="With opacity"
              />
            </div>

            {/* Primary/Secondary */}
            <div>
              <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--primary-text)' }}>
                Primary & Secondary
              </h4>
              <ColorPickerField
                label="Primary"
                value={colors.ratingColors.bgPrimaryLight}
                onChange={(v) => handleRatingColorChange('bgPrimaryLight', v)}
                onReset={() => resetRatingColor(mode, 'bgPrimaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BG_PRIMARY_LIGHT"
              />
              <ColorPickerField
                label="Secondary"
                value={colors.ratingColors.bgSecondaryLight}
                onChange={(v) => handleRatingColorChange('bgSecondaryLight', v)}
                onReset={() => resetRatingColor(mode, 'bgSecondaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BG_SECONDARY_LIGHT"
              />
            </div>

            {/* Borders */}
            <div>
              <h4 className="font-semibold mb-3 text-sm" style={{ color: 'var(--primary-text)' }}>
                Borders
              </h4>
              <ColorPickerField
                label="Border Primary"
                value={colors.ratingColors.borderPrimaryLight}
                onChange={(v) => handleRatingColorChange('borderPrimaryLight', v)}
                onReset={() => resetRatingColor(mode, 'borderPrimaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BORDER_PRIMARY_LIGHT"
              />
              <ColorPickerField
                label="Border Secondary Light"
                value={colors.ratingColors.borderSecondaryLight}
                onChange={(v) => handleRatingColorChange('borderSecondaryLight', v)}
                onReset={() => resetRatingColor(mode, 'borderSecondaryLight')}
                envVariable="NEXT_PUBLIC_RATING_BORDER_SECONDARY_LIGHT"
              />
              <ColorPickerField
                label="Border Secondary Dark"
                value={colors.ratingColors.borderSecondaryDark}
                onChange={(v) => handleRatingColorChange('borderSecondaryDark', v)}
                onReset={() => resetRatingColor(mode, 'borderSecondaryDark')}
                envVariable="NEXT_PUBLIC_RATING_BORDER_SECONDARY_DARK"
              />
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}


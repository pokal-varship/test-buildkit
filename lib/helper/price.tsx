import { getTenantConfig } from "@config/tenant.config";

interface CurrencyFormatOptions {
    prefix?: string;
    suffix?: string;
    amount?: number;
}

export default function formatCurrency({amount = 0, prefix = '', suffix = '' }: CurrencyFormatOptions = {}): string {
    const config = getTenantConfig();
    const spacePrefix = prefix ? prefix : config.currencySymbolPrefix;
    const spaceSuffix = suffix ? suffix : config.currencySymbolSuffix;

    const rounded = Math.round(amount * 100) / 100;
    const formattedAmount = rounded.toFixed(2);

    return `${spacePrefix}${formattedAmount} ${spaceSuffix}`;
}
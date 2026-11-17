
import React, { FC } from 'react';
import Link from 'next/link'; // If you're using React Router, replace with `import { Link } from 'react-router-dom'`
import { cn } from '@lib/utils';
import { useAnalytics } from '@hooks/useAnalytics';

type BreadcrumbItem = {
  label: string;
  link?: string;
  isLink: boolean;
};

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  containerClassName?: string;
  listContainerClassName?: string;
  listItemClassName?: string;
  labelClassName?: string;
  separatorClassName?: string;
  lastItemClassName?: string;
}

const Breadcrumb: FC<BreadcrumbProps> = ({ items, containerClassName, listContainerClassName, listItemClassName, labelClassName, separatorClassName, lastItemClassName }) => {
  const { trackBreadcrumbClicked } = useAnalytics();
  const lastLabel = items[items.length - 1]?.label || '';

  return (
    <nav aria-label="breadcrumb" className={cn("text-sm", containerClassName)}>
      <ol className={cn("flex flex-wrap items-center gap-x-1", listContainerClassName)}>
        {items.map((item, index) => (
          <li key={index} className={cn("flex items-center", listItemClassName)}>
            {item.isLink && item.link ? (
              <Link
                href={item.link}
                className={cn("text-[var(--primary-text-light)] hover:underline capitalize", labelClassName)}
                onClick={() => {
                  trackBreadcrumbClicked(lastLabel, item.label);
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                className={cn(
                  `truncate max-w-[225px] text-[var(--primary-text-light)] ${index === items.length - 1 ? ' font-semibold' : ''} capitalize`,
                  labelClassName,
                  index === items.length - 1 && lastItemClassName
                )}
              >
                {item.label}
              </span>
            )}
            {index < items.length - 1 && (
              <span className={cn("mx-1 text-[var(--primary-text-light)]", separatorClassName)}>/</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;

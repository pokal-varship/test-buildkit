'use client'

import { useEffect, useState } from 'react';
import Image from 'next/image';
import CrossIcon from '@components/icons/CrossIcon';
import PrimaryButton from '@components/buttons/PrimaryButton';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  const [timestamp, setTimestamp] = useState('');

  useEffect(() => {

    const now = new Date();
    setTimestamp(
      now.toLocaleDateString('en-GB') + ', ' + now.toLocaleTimeString('en-GB', { hour12: false })
    );
  }, [error]);

  return (
    <div
      style={{ zIndex: 1000 }}
      className="w-full max-w-full overflow-x-hidden bg-[var(--primary-background)] md:h-[calc(100vh-93px-54px)] mt-3 flex items-center justify-center top-0 left-0 right-0 bottom-0 fixed md:relative"
    >
      <div className="w-full max-w-[85vw] flex flex-col items-center md:max-w-[510px] mb-24 md:mb-0 ">
        <Image onClick={() => window.location.href = '/'} src="/images/icon/close-circle.svg" alt="Close" className='absolute top-5 right-7 hidden md:block cursor-pointer' width={25} height={25} />
        <CrossIcon onClick={() => window.location.href = '/'} className="absolute md:hidden top-4 right-4 bg-transparent border-0 cursor-pointer p-0" />
        <Image src="/images/icon/error.svg" alt="Error" className='w-[82px] h-[82px] md:w-[160px] md:h-[160px]' width={160} height={160} />

        <div className="flex flex-col items-center mt-5 md:mt-8">
          <h2 className="description-font md-heading-2 font-600 md-font-700 text-center mb-[5px] md:mb-[10px] ">
            We&apos;re having trouble loading this page
          </h2>
          <p className="text-[var(--secondary-text)] extra-small-font md-heading-4 text-center mb-5 md:mb-8">
            Something went wrong! You can try refreshing the page or close this screen and try again later.
          </p>
          <PrimaryButton className="md:w-[211px] w-[193px] mt-0 mb-8" onClick={() => reset()}  >Refresh</PrimaryButton>
        </div>

        <div style={{ zIndex: 1000 }} className="text-[var(--secondary-text)] flex flex-col items-center justify-center h-24 text-sm text-center bg-[var(--primary-background)] fixed bottom-0 left-0 right-0 w-full">
          <div className="w-full h-[1px] mb-2 max-w-[90vw] bg-[var(--borders-dividers)]" />
          Error: {error.message}. Time: {timestamp}
        </div>
      </div>
      <style>{`
        .small-font{
            font-size: var(--small-font);
        }
        .extra-small-font {
            font-size: var(--extraSmall-font);
        }
        .description-font {
            font-size: var(--description-font);
        }
        .heading-2 {
            font-size: var(--heading-h2);
        }
        .font-600 {
            font-weight: var(--font-semi-bold);
        }
            @media (min-width: 768px) {
                .md-small-font {
                    font-size: var(--small-font);
                }
                .md-description-font {
                    font-size: var(--description-font);
                }
                     .md-heading-2 {
                font-size: var(--heading-h2);
            }
                .md-heading-4 {
                font-size: var(--heading-h4);
            }
                .md-font-700 {
            font-weight: var(--font-bold);
        }
            }
      `}</style>
    </div>
  );
}
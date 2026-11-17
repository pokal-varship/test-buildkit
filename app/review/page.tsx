'use client'
import { open_dialog } from '@lib/modalHandler';
import { useEffect } from 'react';

export default function ReviewModal() {
  
  useEffect(() => {
        open_dialog('reviewCard', {
        open: true,
        propsData: {
        },
        type: 'reviewCard',
        handlerDialog: ()=>{},
        handleClose: () => { },
        anchor: 'bottom',
        drawerBorderRadius: '0px'
      });  }, []);

  return (
    <>
    </>
  );
} 
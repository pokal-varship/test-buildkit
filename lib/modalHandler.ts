import { DialogClose, DialogOpen } from "./rxSubject";
import { SxProps, Theme } from '@mui/material/styles';

// Typing the parameters for better clarity
interface DialogParams {
    open: boolean;
    anchor: 'top' | 'left' | 'bottom' | 'right';
    propsData: Record<string, unknown>;
    type: string;
    handlerDialog: () => void;
    handleClose: () => void;
    className?: string;
    onlyDialog?: boolean;
    forceDrawer?: boolean;
    drawerBorderRadius?: string;
    /** Dialog position when shown as Dialog (desktop): center | top | bottom | left | right */
    dialogPosition?: 'center' | 'top' | 'bottom' | 'left' | 'right';
    sxStyle?: SxProps<Theme>;
}


export const open_dialog = (dialogType: string, params: DialogParams) => {
    DialogOpen.next({ dialogType, ...params });
};

// for close dialog
export const close_dialog = (params: unknown[]) => {
    DialogClose.next([...params]);
};
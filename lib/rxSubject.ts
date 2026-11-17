import { Subject } from "rxjs";

export const DialogOpen = new Subject();
export const DialogClose = new Subject();
export const DrawerOpen = new Subject();
export const DrawerClose = new Subject();

export const logoutSubject = new Subject<void>();
export const loginSuccessSubject = new Subject<string>();
/** Emitted after wallet recharge payment is verified — refresh transaction history. */
export const walletRechargeSuccessSubject = new Subject<void>();

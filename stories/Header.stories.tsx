import React from 'react';
import { Header } from '../components/Header/Header';
import { YourContextProvider } from '../context/YourContext';

export default {
    title: 'Header',
    component: Header,
};

const Template = (args) => (
    <YourContextProvider>
        <Header {...args} />
    </YourContextProvider>
);

export const LoggedIn = Template.bind({});
LoggedIn.args = {
    onLogin: () => { },
    onLogout: () => { },
    primary: true,
};

// export const LoggedOut = Template.bind({});
// LoggedOut.args = {
//     user: undefined,
//     onLogin: () => { },
//     onLogout: () => { },
// };

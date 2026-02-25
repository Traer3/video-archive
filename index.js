import { registerRootComponent } from 'expo';
import App from './App';
import { DatabaseProvider } from './DatabaseContext';
import React from 'react';

const Root = () =>(
    <DatabaseProvider>
        <App />
    </DatabaseProvider>
)


registerRootComponent(Root)
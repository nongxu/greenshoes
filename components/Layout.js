import React from 'react';

const Layout = ({ children }) => {
    return (
        <div>
            <header>
                <h1>GreenShoes</h1>
            </header>
            <main>{children}</main>
            <footer>
                <p>&copy; {new Date().getFullYear()} GreenShoes. All rights reserved.</p>
            </footer>
        </div>
    );
};

export default Layout;
import React from 'react';
import { Outlet } from 'react-router-dom';
import WebsiteNavbar from './WebsiteNavbar';
import WebsiteFooter from './WebsiteFooter';

const WebsiteLayout = () => {
  return (
    <>
      <WebsiteNavbar />
      <Outlet />
      <WebsiteFooter />
    </>
  );
};

export default WebsiteLayout;


import React from 'react';
import DemoVideo from '@/components/demo/DemoVideo';
import { Helmet } from 'react-helmet-async';

const DemoPage = () => {
  return (
    <>
      <Helmet>
        <title>Interactive Demo - Boinvit</title>
        <meta name="description" content="Watch interactive demos of Boinvit's features, including QR code booking, business management, and mobile experience. See how Boinvit can transform your business." />
      </Helmet>
      <DemoVideo />
    </>
  );
};

export default DemoPage;

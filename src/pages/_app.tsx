import React from "react";

import Head from "next/head";

import type { AppProps } from "next/app";

const MyApp = ({ Component, pageProps }: AppProps) => (
    <>
        <Head>
            <title>react-foobar</title>
        </Head>
        <Component {...pageProps} />
    </>
);

// eslint-disable-next-line import/no-default-export
export default MyApp;

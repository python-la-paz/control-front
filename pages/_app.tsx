import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Session } from "next-auth";
import Layout from "@/components/layout";
import { RecoilRoot } from "recoil";
import Head from "next/head";
import { ThemeProvider } from "@mui/material/styles";
import theme from "@/theme";
import CssBaseline from '@mui/material/CssBaseline';
import { SnackbarProvider } from "notistack";

// function DebugObserver(): any {
//   const snapshot = useRecoilSnapshot();
//   useEffect(() => {
//     console.debug("The following atoms were modified:");
//     for (const node of snapshot.getNodes_UNSTABLE({ isModified: true })) {
//       console.debug(node.key, snapshot.getLoadable(node));
//     }
//   }, [snapshot]);

//   return null;
// }

function MyApp({ Component, pageProps: { session, ...pageProps } }: AppProps<{ session: Session }>) {
  return (
    <SessionProvider session={session}>
      <RecoilRoot>
        <SnackbarProvider maxSnack={3} autoHideDuration={3000} anchorOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}>
          <Head>
            <title>PyDay La Paz 2023</title>
            <meta name="description" content="PyDay La Paz 2023" />
            <meta name="viewport" content="initial-scale=1, width=device-width" />
          </Head>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Layout>
              <Component {...pageProps} />
            </Layout>
          </ThemeProvider>
        </SnackbarProvider>
      </RecoilRoot>
    </SessionProvider>
  );
}

export default MyApp;

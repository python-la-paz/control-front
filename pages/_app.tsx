import { SessionProvider } from "next-auth/react"
import type { AppProps } from "next/app";
import { useEffect } from "react";
import { Session } from "next-auth";
import Layout from "@/components/layout";
import { RecoilRoot } from "recoil";

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
        <Layout>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </SessionProvider>
  );
}

export default MyApp;

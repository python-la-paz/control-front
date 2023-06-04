import { accessTokenState } from "@/atoms";
import { useSession, signIn, signOut } from "next-auth/react"
import { useEffect } from "react";
import { useRecoilState } from "recoil";
export default function LoginButton() {
  const [token, setAccessTokenState] = useRecoilState(accessTokenState);
  const { data: session, status } = useSession()
  useEffect(() => {
    if (status === "authenticated") {
      if (session.user !== undefined) {
        setAccessTokenState(session.user?.access_token);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, status]);
  if (session) {
    return (
      <>
        Signed in as {session.user?.username}<br />
        <button onClick={() => signOut()}>Sign out</button>
      </>
    )
  }
  return (
    <>
      Not signed in <br />
      <button onClick={() => signIn()}>Sign in</button>
    </>
  )
}
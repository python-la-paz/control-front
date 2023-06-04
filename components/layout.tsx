import LoginButton from "./login-btn";

export default function BasicGrid(props: { children?: any }) {
  return (
    <>
      <LoginButton />
      {props?.children}
      {/* <Paper
          sx={{
            boxShadow: "none",
          }}
        >
          
        </Paper> */}
    </>
  );
}
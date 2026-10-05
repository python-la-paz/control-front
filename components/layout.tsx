import { AppBar, Box, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import LoginButton from "./login-btn";
import Link from "next/link";
import { useRouter } from "next/router";

export default function BasicGrid(props: { children?: any }) {
  const { pathname } = useRouter();
  const isSelfService = pathname === "/self" || pathname.startsWith("/self/");

  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" >
          <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link href={isSelfService ? "/self" : "/"} color="inherit" style={{textDecoration: "none", color: "inherit"}}>
                {"PyDay La Paz"}
                </Link>
              </Typography>
            <LoginButton isSelfService={isSelfService} />
          </Toolbar>
        </AppBar>
      </Box>
      <Paper
        sx={{
          boxShadow: "none",
        }}
      >
        {props?.children}
      </Paper>
    </>
  );
}

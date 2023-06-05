import { AppBar, Box, IconButton, Paper, Toolbar, Typography } from "@mui/material";
import LoginButton from "./login-btn";
import Link from "next/link";

export default function BasicGrid(props: { children?: any }) {
  return (
    <>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static" >
          <Toolbar>
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                <Link href="/" color="inherit" style={{textDecoration: "none", color: "inherit"}}>
                PyDay La Paz '23
                </Link>
              </Typography>
            <LoginButton />
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
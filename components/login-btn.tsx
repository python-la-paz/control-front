import { accessTokenState } from "@/atoms";
import { AccountCircle } from "@mui/icons-material";
import { Box, Button, Divider, IconButton, Menu, MenuItem } from "@mui/material";
import { useSession, signIn, signOut } from "next-auth/react"
import Link from "next/link";
import React from "react";
import { useEffect } from "react";
import { useRecoilState } from "recoil";

export default function LoginButton() {
  const menuStyle = { textDecoration: "none", color: "inherit" }
  const [token, setAccessTokenState] = useRecoilState(accessTokenState);
  const { data: session, status } = useSession()
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
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
        <Button
          color="inherit"
          variant="outlined"
          aria-haspopup="true"
          onClick={handleMenu}
        >
          {session.user?.username}
        </Button>

        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          transformOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          open={Boolean(anchorEl)}
          onClose={handleClose}
        >
          <Link href="/registration" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Registro
            </MenuItem>
          </Link>
          <Divider />
          <Link href="/check/in" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Ingresos
            </MenuItem>
          </Link>
          <Link href="/check/out" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Salidas
            </MenuItem>
          </Link>
          <Divider />
          <Link href="/redeem/combo" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Canjear Combo
            </MenuItem>
          </Link>
          <Divider />
          <Link href="/redeem/meal" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Refrigerios
            </MenuItem>
          </Link>
          <Divider />
          <Link href="/points" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Registrar Puntos
            </MenuItem>
          </Link>
          <Link href="/points/participation" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Registrar Participación
            </MenuItem>
          </Link>
          <Link href="/points/redeem" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Canjear Regalos
            </MenuItem>
          </Link>
          <Divider />
          <Link href="/registration/view" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Ver Participante
            </MenuItem>
          </Link>
          <Divider />
          {/* <Link href="/me" style={menuStyle}>
            <MenuItem onClick={handleClose}>
              Perfil
            </MenuItem>
          </Link> */}
          <MenuItem onClick={() => signOut()}>Salir</MenuItem>
        </Menu>
      </>
    )
  }
  return (
    <>
      <IconButton
        size="large"
        aria-label="account of current user"
        aria-controls="menu-appbar"
        aria-haspopup="true"
        onClick={handleMenu}
        color="inherit"
      >
        <AccountCircle />
      </IconButton>
      <Menu
        id="menu-appbar"
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        keepMounted
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        open={Boolean(anchorEl)}
        onClose={handleClose}
      >
        <MenuItem onClick={() => signIn()}>Ingresar</MenuItem>
      </Menu>
    </>
  )
}
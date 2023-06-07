import { Box, Container, Typography } from "@mui/material";

export default function IndexPage() {
    return (
        <Container fixed>
            <Box justifyContent="center" alignItems="center" display="flex" >
                <Typography variant="h4">Control</Typography>
            </Box>
            <Box justifyContent="center" alignItems="center" display="flex" >
                <Typography variant="h5">{"PyDay La Paz '23"}</Typography>
            </Box>
        </Container>
    )
}
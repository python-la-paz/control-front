import { postRegistration } from "@/lib/http";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { accessTokenState } from "@/atoms";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
let html5QrcodeScanner: Html5QrcodeScanner;
export default function Registration() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [token] = useRecoilState(accessTokenState);
    const { enqueueSnackbar } = useSnackbar();
    const [ci, setCI] = useState<string>("")
    const [qr, setQR] = useState<string>("")
    const qrcodeRegionId = "html5qr-code-full-region";

    const onNewScanResult = (qr: string) => {
        setQR(qr)
        html5QrcodeScanner.pause()
    }
    const onScannError = (s: string) => {
        console.log(s)
    }
    const handleCIChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCI(event.target.value);
    };

    const handleSendRegister = async () => {
        const response = await postRegistration(token, { ci: ci, control_code: qr });
        enqueueSnackbar(response.message, {
            variant: response.error ? "error" : "success",
        });
        if (!response.error) {
            handleCleanRegister()
        }
    }
    const handleCleanRegister = () => {
        setCI("")
        setQR("")
        try {
            console.log(html5QrcodeScanner);
            html5QrcodeScanner.resume()
        } catch (e) {
            console.log(e)
        }
    }



    useEffect(() => {
        if (!session) {
            router.replace('/api/auth/signin');
        }
        // when component mounts
        const config = { fps: 10, qrbox: 300, disableFlip: false };
        const verbose = false;
        html5QrcodeScanner = new Html5QrcodeScanner(qrcodeRegionId, config, verbose);
        html5QrcodeScanner.render(onNewScanResult, onScannError);
        // cleanup function when component will unmount 
        return () => {
            html5QrcodeScanner.clear().catch(error => {
                console.error("Failed to clear html5QrcodeScanner. ", error);
            });
        };
    }, []);


    
    return (
        <Container fixed>
            <Box justifyContent="center" alignItems="center" display="flex" >
                <Typography variant="h4">Registro</Typography>
            </Box>
            <br />
            <TextField id="ci" label="Carnet de Identidad" variant="outlined" value={ci} onChange={handleCIChange} fullWidth />
            <br />
            <br />
            <div id={qrcodeRegionId} />
            <br />
            {qr !== "" &&
                <>
                    <Button fullWidth variant="contained" onClick={handleSendRegister} disabled={ci === "" || qr === ""}>Aceptar Registro</Button>
                    <br />
                    <br />
                    <Button fullWidth variant="outlined" color="error" onClick={handleCleanRegister}>Limpiar</Button>
                </>
            }
        </Container>
    )
}
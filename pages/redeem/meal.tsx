import { postRedeemMeal } from "@/lib/http";
import { Box, Button, Container, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { accessTokenState } from "@/atoms";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
let html5QrcodeScanner: Html5QrcodeScanner;
export default function RedeemMeal() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [token] = useRecoilState(accessTokenState);
    const { enqueueSnackbar } = useSnackbar();
    const [qr, setQR] = useState<string>("")
    const qrcodeRegionId = "html5qr-code-full-region-redeem-meal";


    const onNewScanResult = (qr: string) => {
        setQR(qr)
        html5QrcodeScanner.pause()
    }
    const onScannError = (s: string) => {
    }

    const handleSend = async () => {
        const response = await postRedeemMeal(token, { participant_control_code: qr });
        enqueueSnackbar(response.message, {
            variant: response.error ? "error" : "success",
        });
        if (!response.error) {
            handleClean();
        } else {
            html5QrcodeScanner.resume();
        }
    }
    const handleClean = () => {
        setQR("")
        try {
            console.log(html5QrcodeScanner);
            html5QrcodeScanner.resume()
        } catch (e) {
            console.log(e)
        }
    }
    useEffect(() => {
        const fetchData = async () => {
            if (status === 'loading') {
                return;
            }
            if (!session) {
                router.replace('/api/auth/signin');
                return null;
            }
        };
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [session, status]);
    useEffect(() => {
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
                <Typography variant="h4">Refrigerios</Typography>
            </Box>
            <br />
            <br />
            <div id={qrcodeRegionId} />
            <br />
            {qr !== "" &&
                <>
                    <Button fullWidth variant="contained" onClick={handleSend} disabled={qr === ""}>Entregar Refrigerio</Button>
                    <br />
                    <br />
                    <Button fullWidth variant="outlined" color="error" onClick={handleClean}>Limpiar</Button>
                </>
            }
        </Container>
    )
}
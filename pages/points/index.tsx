import { getPresentations, postObtainPoints } from "@/lib/http";
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { accessTokenState } from "@/atoms";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { PresentationProps } from "@/const";
import React from "react";
let html5QrcodeScanner: Html5QrcodeScanner;
export default function ObtainPoints() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [token] = useRecoilState(accessTokenState);
    const { enqueueSnackbar } = useSnackbar();
    const empty = [{ _id: "", name: "Seleccione una presentación", kind: "" } as PresentationProps]
    const [presentations, setPresentations] = useState<PresentationProps[]>(empty)
    const [presentationSelected, setPresentationSelected] = useState<string>("")
    const [qr, setQR] = useState<string>("")
    const qrcodeRegionId = "html5qr-code-full-region-check-in";


    const onNewScanResult = (qr: string) => {
        setQR(qr)
        html5QrcodeScanner.pause()
    }
    const onScannError = (s: string) => {
    }
    const handlePresentationChange = (event: SelectChangeEvent) => {
        setPresentationSelected(event.target.value as string);
    };

    const handleSend = async () => {
        const response = await postObtainPoints(token, { participant_control_code: qr, presentation_id : presentationSelected  });
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
        if (!session) {
            router.replace('/api/auth/signin');
            return;
        }
    }, [session])
    useEffect(() => {
        getPresentations(token).then((res) => {
            if (res.error) {
                enqueueSnackbar(res.message, {
                    variant: "error",
                });
            } else {
                const data = empty.concat(res.data)
                setPresentations(data)
            }

        })

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
                <Typography variant="h4">Registrar Puntos</Typography>
            </Box>
            <br />
            <FormControl fullWidth>
                <InputLabel id="select-presentation-label">Presentación</InputLabel>
                <Select
                    labelId="select-presentation-label"
                    id="select-presentation"
                    value={presentationSelected}
                    label="Presentación"
                    onChange={handlePresentationChange}
                >
                    {presentations.map((presentation) => (
                        <MenuItem key={presentation.name} value={presentation._id} disabled={presentation._id === ""}>
                            <Typography variant="body1"  sx={{display: "inline-block", whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                ({presentation.kind.toUpperCase()}) {presentation.name}
                            </Typography>

                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <br />
            <br />
            <div id={qrcodeRegionId} />
            <br />
            {qr !== "" &&
                <>
                    <Button fullWidth variant="contained" onClick={handleSend} disabled={presentationSelected === "" || qr === ""}>Obtener Puntos</Button>
                    <br />
                    <br />
                    <Button fullWidth variant="outlined" color="error" onClick={handleClean}>Limpiar</Button>
                </>
            }
        </Container>
    )
}
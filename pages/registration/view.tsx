import { accessTokenState } from "@/atoms";
import { ParticipantProps } from "@/const";
import { getParticipantByCiFull, getParticipantByControlCode } from "@/lib/http";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useSnackbar } from "notistack";
import { useEffect, useState } from "react";
import { useRecoilState } from "recoil";
let html5QrcodeScanner: Html5QrcodeScanner;
export default function RedeemMeal() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [token] = useRecoilState(accessTokenState);
    const [participant, setParticipant] = useState<ParticipantProps>({} as ParticipantProps)
    const { enqueueSnackbar } = useSnackbar();
    const [qr, setQR] = useState<string>("")
    const [ci, setCI] = useState<string>("")

    const qrcodeRegionId = "html5qr-code-full-region-view-participant";

    const handleCIChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCI(event.target.value);
    };
    const handleSearch = async () => {
        setParticipant({} as ParticipantProps)
        if (ci === "") {
            enqueueSnackbar("Ingrese un carnet de identidad", {
                variant: "error",
            });
            return;
        }
        const response = await getParticipantByCiFull(token, { ci: ci });
        if (response.error) {
            enqueueSnackbar(response.message, {
                variant: response.error ? "error" : "success",
            });
            return;
        }
        setParticipant(response.data)
    }

    const onNewScanResult = (qr: string) => {
        setQR(qr)
        html5QrcodeScanner.pause()
    }
    const onScannError = (s: string) => {
    }

    const handleSend = async () => {
        setParticipant({} as ParticipantProps)
        const response = await getParticipantByControlCode(token, { participant_control_code: qr });
        if (response.error) {
            enqueueSnackbar(response.message, {
                variant: response.error ? "error" : "success",
            });
            return;
        }
        setParticipant(response.data)


    }
    const handleClean = () => {
        setQR("")
        setParticipant({} as ParticipantProps)
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
                <Typography variant="h4">Ver Participante</Typography>
            </Box>
            <br />
            <Box>
                <TextField id="ci" label="Carnet de Identidad" variant="outlined" value={ci} onChange={handleCIChange} fullWidth />
            </Box>
            <br />
            <Box>
                <Button fullWidth variant="contained" onClick={handleSearch}>Buscar Participante</Button>
            </Box>
            <br />
            <br />
            <div id={qrcodeRegionId} />
            <br />
            {qr !== "" &&
                <>
                    <Box justifyContent="center" alignItems="center" display="flex" >
                        <Button fullWidth variant="contained" onClick={handleSend} disabled={qr === ""}>Ver Datos</Button>
                    </Box>
                    <br />
                    <Box justifyContent="center" alignItems="center" display="flex" >
                        <Button fullWidth variant="outlined" color="error" onClick={handleClean}>Limpiar</Button>
                    </Box>
                    <br />
                </>
            }
            {participant._id !== undefined && participant._id !== "" &&
                <>
                    <Box justifyContent="center" alignItems="center" display="flex" >
                        <Typography variant="h4">{participant.name}</Typography>
                    </Box>
                    <Box justifyContent="center" alignItems="center" display="flex" >
                        <Typography variant="h6">{participant.registration ? "Ya registrado" : "Disponible para Registrar"}</Typography>
                    </Box>
                    <Box justifyContent="center" alignItems="center" display="flex" >
                        <Typography variant="h6">Talla: {participant.t_shirt_size}</Typography>
                    </Box>
                    {participant.registration &&
                        <>
                            <Box justifyContent="center" alignItems="center" display="flex">
                                <Typography variant="h6">Puntos: {participant.points}</Typography>
                            </Box>
                        </>
                    }
                    {participant.combos_items &&
                        <>
                            {participant.combos_items.length > 0 &&
                                <Box justifyContent="center" alignItems="center" display="flex">
                                    <Typography variant="h6">Combos:</Typography>
                                </Box>
                            }
                            {participant.combos_items.map((combo, index) => {
                                return (
                                    <Box justifyContent="center" alignItems="center" display="flex" key={index}>
                                        <Typography variant="h6">{combo}</Typography>
                                    </Box>
                                )
                            })}

                        </>
                    }
                    <br />
                    {participant.locations_items &&
                        <>
                            {participant.locations_items.length > 0 &&
                                <Box justifyContent="center" alignItems="center" display="flex">
                                    <Typography variant="h6">Lugares:</Typography>
                                </Box>
                            }
                            {participant.locations_items.map((location, index) => {
                                return (
                                    <Box justifyContent="center" alignItems="center" display="flex" key={index}>
                                        <Typography variant="h6">{location}</Typography>
                                    </Box>
                                )
                            })}
                        </>
                    }
                </>

            }
        </Container>
    )
}
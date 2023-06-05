import { getLocations, postCheckInOut, postRegistration } from "@/lib/http";
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, TextField, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { accessTokenState } from "@/atoms";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { LocationProps } from "@/const";
let html5QrcodeScanner: Html5QrcodeScanner;
export default function CheckIn() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [token] = useRecoilState(accessTokenState);
    const { enqueueSnackbar } = useSnackbar();
    const empty = [{ _id: "", name: "Seleccione una ubicación" } as LocationProps]
    const [locations, setLocations] = useState<LocationProps[]>(empty)
    const [locationSelected, setLocationSelected] = useState<string>("")
    const [qr, setQR] = useState<string>("")
    const qrcodeRegionId = "html5qr-code-full-region-check-in";


    const onNewScanResult = (qr: string) => {
        setQR(qr)
        html5QrcodeScanner.pause()
    }
    const onScannError = (s: string) => {
        console.log(s)
    }
    const handleLocationChange = (event: SelectChangeEvent) => {
        setLocationSelected(event.target.value as string);
    };

    const handleSendRegister = async () => {
        const response = await postCheckInOut(token, { participant_control_code: qr, location_id: locationSelected, check: true });
        enqueueSnackbar(response.message, {
            variant: response.error ? "error" : "success",
        });
        if (!response.error) {
            handleCleanRegister();
        } else {
            html5QrcodeScanner.resume();
        }
    }
    const handleCleanRegister = () => {
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
        getLocations(token).then((res) => {
            if (res.error) {
                enqueueSnackbar(res.message, {
                    variant: "error",
                });
            } else {
                const data = empty.concat(res.data)
                setLocations(data)
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
                <Typography variant="h4">Ingreso</Typography>
            </Box>
            <br />
            <FormControl fullWidth>
                <InputLabel id="select-location-label">Ubicación</InputLabel>
                <Select
                    labelId="select-location-label"
                    id="select-location"
                    value={locationSelected}
                    label="Ubicación"
                    onChange={handleLocationChange}
                >
                    {locations.map((location) => (
                        <MenuItem key={location.name} value={location._id} disabled={location._id === ""}>{location.name}</MenuItem>
                    ))}
                </Select>
            </FormControl>
            <br />
            <br />
            <div id={qrcodeRegionId} />
            <br />
            {qr !== "" &&
                <>
                    <Button fullWidth variant="contained" onClick={handleSendRegister} disabled={locationSelected === "" || qr === ""}>Check In</Button>
                    <br />
                    <br />
                    <Button fullWidth variant="outlined" color="error" onClick={handleCleanRegister}>Limpiar</Button>
                </>
            }
        </Container>
    )
}
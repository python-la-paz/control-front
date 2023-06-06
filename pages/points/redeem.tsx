import { getGifts, postRedeemGift } from "@/lib/http";
import { Box, Button, Container, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { accessTokenState } from "@/atoms";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { GiftProps } from "@/const";
import React from "react";
let html5QrcodeScanner: Html5QrcodeScanner;
export default function RedeemPoints() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [token] = useRecoilState(accessTokenState);
    const { enqueueSnackbar } = useSnackbar();
    const empty = [{ _id: "", product_name: "Seleccione un Regalo", points: 0 } as GiftProps]
    const [gifts, setGifts] = useState<GiftProps[]>(empty)
    const [giftSelected, setGiftSelected] = useState<string>("")
    const [qr, setQR] = useState<string>("")
    const qrcodeRegionId = "html5qr-code-full-region-check-in";


    const onNewScanResult = (qr: string) => {
        setQR(qr)
        html5QrcodeScanner.pause()
    }
    const onScannError = (s: string) => {
    }
    const handleGiftChange = (event: SelectChangeEvent) => {
        setGiftSelected(event.target.value as string);
    };

    const handleSend = async () => {
        const response = await postRedeemGift(token, { participant_control_code: qr, gift_id : giftSelected  });
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
        getGifts(token).then((res) => {
            if (res.error) {
                enqueueSnackbar(res.message, {
                    variant: "error",
                });
            } else {
                const data = empty.concat(res.data)
                setGifts(data)
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
                <Typography variant="h4">Canjear Puntos</Typography>
            </Box>
            <br />
            <FormControl fullWidth>
                <InputLabel id="select-gift-label">Regalos</InputLabel>
                <Select
                    labelId="select-gift-label"
                    id="select-gift"
                    value={giftSelected}
                    label="Presentación"
                    onChange={handleGiftChange}
                >
                    {gifts.map((gift) => (
                        <MenuItem key={gift._id} value={gift._id} disabled={gift._id === ""}>
                            <Typography variant="body1"  sx={{display: "inline-block", whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                {gift.product_name} ({gift.points} Pts.) 
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
                    <Button fullWidth variant="contained" onClick={handleSend} disabled={giftSelected === "" || qr === ""}>Canjear Regalo</Button>
                    <br />
                    <br />
                    <Button fullWidth variant="outlined" color="error" onClick={handleClean}>Limpiar</Button>
                </>
            }
        </Container>
    )
}
import { getParticipantByControlCode, getParticipantRedeemCombos, postGetCombosList, postRedeemCombo, postRedeemMeal } from "@/lib/http";
import { Box, Button, Checkbox, Chip, Container, FormControl, InputLabel, ListItemText, MenuItem, OutlinedInput, Select, SelectChangeEvent, Typography } from "@mui/material";
import { Html5QrcodeScanner } from "html5-qrcode";
import { useEffect, useState } from "react";
import { useSnackbar } from "notistack";
import { useRecoilState } from "recoil";
import { accessTokenState } from "@/atoms";
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { ComboProps, ParticipantProps, ParticipantRedeemCombosProps } from "@/const";
let html5QrcodeScanner: Html5QrcodeScanner;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};
export default function RedeemCombo() {
    const router = useRouter();
    const { data: session, status } = useSession();

    const [token] = useRecoilState(accessTokenState);
    const { enqueueSnackbar } = useSnackbar();
    const [participant, setParticipant] = useState<ParticipantProps>({} as ParticipantProps)
    const [combos, setCombos] = useState<ComboProps[]>([])
    const [redeemCombos, setRedeemCombos] = useState<ParticipantRedeemCombosProps[]>([])
    const [comboSelected, setComboSelected] = useState<string>("")
    const [actualCombo, setActualCombo] = useState<ComboProps>({} as ComboProps)
    const [productsSelected, setProductsSelected] = useState<string[]>([])
    const [qr, setQR] = useState<string>("")
    const qrcodeRegionId = "html5qr-code-full-region-redeem-combo";


    const onNewScanResult = (qr: string) => {
        setQR(qr)
        html5QrcodeScanner.pause()
    }
    const onScannError = (s: string) => {
    }

    const handleSend = async () => {
        setComboSelected("")
        setActualCombo({} as ComboProps)
        setProductsSelected([])

        const response = await getParticipantByControlCode(token, { participant_control_code: qr });
        if (response.error) {
            enqueueSnackbar(response.message, {
                variant: "error",
            });
            handleClean();
            return;
        }
        if (response.data.combos.length === 0) {
            enqueueSnackbar("No tiene combos para canjear", {
                variant: "error",
            });
            handleClean();
            return;
        }
        setParticipant(response.data)

        const responseCombos = await postGetCombosList(token, response.data.combos);
        if (responseCombos.error) {
            enqueueSnackbar(responseCombos.message, {
                variant: "error",
            });
            handleClean();
            return;
        }
        setCombos(responseCombos.data)

        const responseCombosRedeem = await getParticipantRedeemCombos(token, { participant_control_code: qr });
        if (responseCombosRedeem.error) {
            enqueueSnackbar(responseCombosRedeem.message, {
                variant: "error",
            });
            handleClean();
            return;
        }
        setRedeemCombos(responseCombosRedeem.data)



    }
    const handleRedeemCombo = async () => {
        const response = await postRedeemCombo(token, { participant_control_code: qr, combo_id: comboSelected, products_id: productsSelected });
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
        setParticipant({} as ParticipantProps)
        setCombos([])
        setRedeemCombos([])
        setComboSelected("")
        setActualCombo({} as ComboProps)
        setProductsSelected([])

        try {
            console.log(html5QrcodeScanner);
            html5QrcodeScanner.resume()
        } catch (e) {
            console.log(e)
        }
    }
    const handleComboChange = (event: SelectChangeEvent) => {
        setComboSelected(event.target.value as string);
        const combo = combos.find((combo) => combo._id === event.target.value)
        if (combo) {
            redeemCombos.forEach((redeemCombo) => {
                if (redeemCombo.combo === combo._id) {
                    combo.products_items.forEach((product) => {
                        if (product.disabled === undefined) {
                            product.disabled = false
                        }
                        product.disabled = product.disabled || redeemCombo.products.includes(product._id)
                    })
                }
            })
            setActualCombo(combo)
        }
        setProductsSelected([])

    };
    const handleProductsChange = (event: SelectChangeEvent<typeof productsSelected>) => {
        const {
            target: { value },
        } = event;
        setProductsSelected(
            // On autofill we get a the stringified value.
            typeof value === 'string' ? value.split(',') : value,
        );
    };
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
                <Typography variant="h4">Canje de Combos</Typography>
            </Box>
            <div id={qrcodeRegionId} />
            <br />
            {qr !== "" &&
                <>
                    <Button fullWidth variant="outlined" onClick={handleSend} disabled={qr === ""}>Consultar Combos</Button>
                    <br />
                    <br />
                    <Button fullWidth variant="outlined" color="error" onClick={handleClean}>Limpiar</Button>
                    <br />
                    <br />

                    {participant._id !== "" &&
                        <>
                            {combos.length !== 0 &&
                                <>
                                    <Box justifyContent="center" alignItems="center" display="flex" >
                                        <Typography variant="h5">Combos y productos</Typography>
                                    </Box>
                                    <Box justifyContent="center" alignItems="center" display="flex" >
                                        <Typography variant="h6">Talla: {participant.t_shirt_size}</Typography>
                                    </Box>
                                    <br />
                                    <FormControl fullWidth>
                                        <InputLabel id="select-combo-label">Combos Disponibles</InputLabel>
                                        <Select
                                            labelId="select-combo-label"
                                            id="select-combo"
                                            value={comboSelected}
                                            label="Combos Disponibles"
                                            onChange={handleComboChange}
                                        >
                                            {combos.map((combo) => (
                                                <MenuItem key={combo._id} value={combo._id} disabled={combo._id === ""}>
                                                    <Typography variant="body1" sx={{ display: "inline-block", whiteSpace: "pre-line", wordBreak: "break-word" }}>
                                                        {combo.name}
                                                    </Typography>
                                                </MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </>
                            }
                            <br />
                            {comboSelected !== "" &&
                                <>
                                    <br />
                                    <FormControl fullWidth>
                                        <InputLabel id="select-products-label">Productos</InputLabel>
                                        <Select

                                            labelId="select-products-label"
                                            id="select-products"
                                            multiple
                                            value={productsSelected}
                                            onChange={handleProductsChange}
                                            input={<OutlinedInput label="Productos" />}
                                            renderValue={(selected) => {
                                                const selectedProducts = selected as string[]
                                                return (
                                                    <div>
                                                        {selectedProducts.map((value) => (
                                                            <Chip key={value} label={actualCombo.products_items.find((product) => product._id === value)?.name} />
                                                        ))}
                                                    </div>
                                                )


                                            }}
                                            MenuProps={MenuProps}
                                        >
                                            {actualCombo._id !== "" && actualCombo.products_items.map((product) => (
                                                <MenuItem key={product._id} value={product._id} disabled={product.disabled !== undefined ? product.disabled : false}>
                                                    <Checkbox checked={productsSelected.indexOf(product._id) > -1} />
                                                    <ListItemText
                                                        sx={{ display: "inline-block", whiteSpace: "pre-line", wordBreak: "break-word" }}
                                                        primary={`${product.disabled === true ? "CANJEADO - " : ""} ${product.name}`} />
                                                </MenuItem>
                                            ))
                                            }
                                        </Select>
                                    </FormControl>
                                    <br />
                                    <br />
                                    <Button fullWidth variant="contained" onClick={handleRedeemCombo} disabled={qr === "" || comboSelected === "" || productsSelected.length === 0}>Reclamar Combo</Button>
                                </>
                            }
                        </>
                    }

                </>
            }
        </Container>
    )
}
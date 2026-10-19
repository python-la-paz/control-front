import { SelfServiceParticipant } from "@/const";
import { postSelfServiceRegistration } from "@/lib/http_self_service";
import styles from "@/styles/hologram.module.css";
import { Box, Button, Container, TextField, Typography } from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { useSnackbar } from "notistack";
import { useEffect, useRef, useState } from "react";
import VanillaTilt, { type HTMLVanillaTiltElement, type TiltValues } from "vanilla-tilt";

export default function SelfRegistration() {
    const [participant, setParticipant] = useState<SelfServiceParticipant>({} as SelfServiceParticipant)
    const { enqueueSnackbar } = useSnackbar();
    const [ci, setCI] = useState<string>("")
    const [birthday, setBirthday] = useState<string>(new Date().toISOString().split('T')[0])
    const cardRef = useRef<HTMLDivElement & Partial<HTMLVanillaTiltElement>>(null)
    const [registered, setRegistered] = useState<boolean>(false)
    const [downloaded, setDownloaded] = useState<boolean>(false)
    const [downloading, setDownloading] = useState<boolean>(false)
    const [loading, setLoading] = useState<boolean>(false)
    const registrationPendingRef = useRef(false)

    const showCredential = participant.control_code !== undefined && !!participant.qr_code

    useEffect(() => {
        const card = cardRef.current
        if (!showCredential || !card) return

        const onTiltChange = (event: Event) => {
            const { tiltX, tiltY } = (event as CustomEvent<TiltValues>).detail
            card.style.setProperty("--angle", `${Number(tiltX) + Number(tiltY)}deg`)
        }
        card.addEventListener("tiltChange", onTiltChange)

        VanillaTilt.init(card, {
            reverse: true,
            max: 20,
            scale: 1.01,
            speed: 400,
            perspective: 1000,
            gyroscope: true,
            "full-page-listening": true,
            glare: true,
            "max-glare": 0.2,
            
        })

        return () => {
            card.removeEventListener("tiltChange", onTiltChange)
            card.vanillaTilt?.destroy()
            card.style.removeProperty("--angle")
        }
    }, [showCredential])

    const handleDownloadQR = async () => {
        const card = cardRef.current
        if (!card || downloading) return
        const fileName = `credencial-${participant.control_code}.png`
        setDownloading(true)
        try {
            const { toPng } = await import("html-to-image")
            const url = await toPng(card, {
                backgroundColor: "#ffffff",
                pixelRatio: 3,
                skipFonts: true,
                style: {
                    transform: "none",
                    transition: "none",
                    boxShadow: "none",
                },
            })
            const link = document.createElement("a")
            link.href = url
            link.download = fileName
            document.body.appendChild(link)
            link.click()
            link.remove()
            setDownloaded(true)
        } catch {
            enqueueSnackbar("No se pudo descargar el QR", { variant: "error" })
            setDownloaded(false)
        } finally {
            setDownloading(false)
        }
    }


    const handleSendRegister = async () => {
        if (registrationPendingRef.current || registered) return
        registrationPendingRef.current = true
        setLoading(true)
        try {
            const response = await postSelfServiceRegistration({ ci: ci, birthday: birthday });
            enqueueSnackbar(response.message, {
                variant: response.error ? "error" : "success",
            });
            if (!response.error) {
                setParticipant(response.data)
                setRegistered(true)
                setDownloaded(false)
            }
        } catch {
            enqueueSnackbar("No se pudo realizar la acreditacion", { variant: "error" })
        } finally {
            registrationPendingRef.current = false
            setLoading(false)
        }
    }
    const handleCleanRegister = (data: SelfServiceParticipant) => {
        setCI("")
        setBirthday(new Date().toISOString().split('T')[0])
        setParticipant(data)
        setRegistered(false)
        setDownloaded(false)
    }
    const handleCIChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCI(event.target.value);
    };

    return (
        <Container fixed>
            <Box justifyContent="center" alignItems="center" display="flex" >
                <Typography variant="h4">Acreditación</Typography>
            </Box>
            <br />
            <Box>
                <TextField id="ci" label="Carnet de Identidad" variant="outlined" value={ci} onChange={handleCIChange} fullWidth />
            </Box>
            <br />
            <Box>
                <TextField
                id="birthday"
                label="Fecha de Nacimiento"
                type="date"
                variant="outlined"
                value={birthday}
                onChange={(event) => setBirthday(event.target.value)}
                fullWidth
                />
            </Box>
            <br />
            <Button fullWidth variant="contained" onClick={handleSendRegister} disabled={loading || registered ||  ci === "" || birthday === ""}>
                {loading ? "Acreditando..." : "Acreditarse"}
            </Button>
            <br />
            <br />
            <Button fullWidth variant="outlined" color="error" onClick={() => handleCleanRegister({} as SelfServiceParticipant)}
                disabled={loading || (registered && !downloaded)}>Limpiar</Button>
            {showCredential &&
                <>
                    <br />
                    <br />
                    <Typography variant="h6" align="center">Su código de control es: {participant.control_code}</Typography>
                    <div className={styles.grid}>
                        <div
                            className={styles.card}
                            ref={cardRef}
                        >
                            <div className={styles.cardContent}>
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={participant.qr_code} alt={participant.control_code} />
                            </div>
                        </div>
                    </div>
                    <Button fullWidth variant="contained" color="primary" startIcon={<DownloadIcon />} onClick={handleDownloadQR} disabled={downloading}>
                        {downloading ? "Descargando..." : "Descargar Credencial QR"}
                    </Button>
                </>
            }
        </Container>
    )
}
import { SelfServiceRedeem } from "@/const";
import { getSelfServiceGift, postSelfServiceRedeemGift } from "@/lib/http_self_service";
import { readQrControlCode } from "@/lib/qr";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import RedeemIcon from "@mui/icons-material/Redeem";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogContentText,
	DialogTitle,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

function safeDownloadUrl(value: string): string | undefined {
	if (!value?.trim()) return;
	try {
		const url = new URL(value.trim(), "https://localhost");
		if (url.protocol === "https:" || url.protocol === "http:") return value.trim();
	} catch {}
}

export default function SelfGiftRedeem() {
	const router = useRouter();
	const { enqueueSnackbar } = useSnackbar();
	const [checking, setChecking] = useState(true);
	const [available, setAvailable] = useState(false);
	const [availabilityError, setAvailabilityError] = useState<string | null>(null);
	const [reading, setReading] = useState(false);
	const [redeeming, setRedeeming] = useState(false);
	const [fileName, setFileName] = useState("");
	const [controlCode, setControlCode] = useState("");
	const [ci, setCI] = useState("");
	const [result, setResult] = useState<SelfServiceRedeem | null>(null);
	const pendingRef = useRef(false);
	const busy = checking || reading || redeeming;
	const canRedeem = available && !busy && !!controlCode && !!ci.trim() && !result;
	const downloadUrl = result ? safeDownloadUrl(result.download_url) : undefined;

	useEffect(() => {
		let active = true;
		getSelfServiceGift().then(response => {
			if (!active) return;
			if (response.error) {
				setAvailabilityError(response.message || "No hay un regalo disponible.");
			} else {
				setAvailable(true);
			}
		}).catch(() => {
			if (active) setAvailabilityError("No se pudo conectar con el servidor para comprobar la disponibilidad.");
		}).finally(() => {
			if (active) setChecking(false);
		});
		return () => { active = false; };
	}, []);

	const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !available || busy || result || pendingRef.current) return;
		pendingRef.current = true;
		setReading(true);
		setControlCode("");
		setCI("");
		setFileName(file.name);
		try {
			setControlCode(await readQrControlCode(file));
		} catch (error) {
			enqueueSnackbar(error instanceof Error ? error.message : "No se pudo leer la imagen QR.", { variant: "error" });
		} finally {
			pendingRef.current = false;
			setReading(false);
		}
	};

	const handleRedeem = async () => {
		if (!canRedeem || pendingRef.current) return;
		pendingRef.current = true;
		setRedeeming(true);
		try {
			const response = await postSelfServiceRedeemGift({ control_code: controlCode, ci: ci.trim() });
			if (response.error) {
				enqueueSnackbar(response.message || "No se pudo canjear el regalo.", { variant: "error" });
			} else {
				setResult(response.data);
			}
		} catch {
			enqueueSnackbar("No se pudo confirmar el canje. Verifica con el equipo del evento antes de volver a intentarlo.", { variant: "error" });
		} finally {
			pendingRef.current = false;
			setRedeeming(false);
		}
	};

	const handleCloseError = () => { void router.replace("/self"); };

	return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Stack spacing={3}>
				<Typography component="h1" variant="h4">Canje de regalo</Typography>
				{checking &&
					<Box role="status" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<CircularProgress size={24} />
						<Typography>Comprobando disponibilidad...</Typography>
					</Box>
				}
				{available && <>
					{!result && <Alert severity="success">Hay un regalo disponible</Alert>}
					<Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={busy || !!result}>
						{reading ? "Leyendo QR..." : "Subir credencial QR"}
						<input hidden type="file" accept="image/*" onChange={handleFileSelection} disabled={busy || !!result} />
					</Button>
					{fileName && <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{fileName}</Typography>}
					{controlCode && <Typography sx={{ overflowWrap: "anywhere" }}>Código de control: {controlCode}</Typography>}
					<TextField id="gift-ci" label="Carnet de Identidad" value={ci} onChange={event => setCI(event.target.value)} disabled={busy || !controlCode || !!result} required fullWidth />
					<Button variant="contained" startIcon={<RedeemIcon />} onClick={handleRedeem} disabled={!canRedeem}>
						{redeeming ? "Canjeando..." : "Canjear regalo"}
					</Button>
					{result &&
						<Box component="section" aria-labelledby="gift-result-title" sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}>
							<Stack spacing={2}>
								<Alert severity="success">{result.message || "Regalo canjeado"}</Alert>
								<Typography id="gift-result-title" component="h2" variant="h6">{result.product_name || "Tu regalo"}</Typography>
								{result.discount_code && <TextField label="Código de descuento" value={result.discount_code} InputProps={{ readOnly: true }} fullWidth />}
								{downloadUrl && <Button component="a" href={downloadUrl} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<DownloadIcon />}>Descargar regalo</Button>}
							</Stack>
						</Box>
					}
				</>}
				<Button component={Link} href="/self" startIcon={<ArrowBackIcon />}>Volver al inicio</Button>
			</Stack>
			<Dialog open={availabilityError !== null} onClose={handleCloseError} aria-labelledby="gift-error-title">
				<DialogTitle id="gift-error-title">Regalo no disponible</DialogTitle>
				<DialogContent>
					<DialogContentText sx={{ mb: 2 }}>No se pudo comprobar la disponibilidad del regalo. Si está agotado o no existe, no se puede realizar el canje.</DialogContentText>
					<DialogContentText sx={{ overflowWrap: "anywhere" }}>{availabilityError}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseError}>Volver al inicio</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

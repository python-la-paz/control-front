import { SelfServiceResult } from "@/const";
import { getSelfServiceCheck, postSelfServiceCheck } from "@/lib/http_self_service";
import { readQrControlCode } from "@/lib/qr";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
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
	Typography,
} from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSnackbar } from "notistack";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

export default function SelfParticipationCheck() {
	const router = useRouter();
	const code = typeof router.query.code === "string" ? router.query.code : "";
	const { enqueueSnackbar } = useSnackbar();
	const [validating, setValidating] = useState(true);
	const [validatedCode, setValidatedCode] = useState<string | null>(null);
	const [validationError, setValidationError] = useState<{ message: string, status?: number } | null>(null);
	const [reading, setReading] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [fileName, setFileName] = useState("");
	const [controlCode, setControlCode] = useState("");
	const [result, setResult] = useState<SelfServiceResult | null>(null);
	const pendingRef = useRef(false);
	const currentCodeRef = useRef(code);
	currentCodeRef.current = code;

	const valid = code !== "" && validatedCode === code && !validationError;

	useEffect(() => {
		if (!router.isReady) return;
		let active = true;
		setValidating(true);
		setValidatedCode(null);
		setValidationError(null);
		setControlCode("");
		setFileName("");
		setResult(null);

		const validate = async () => {
			try {
				if (!code) {
					setValidationError({ message: "El código no existe o no está disponible.", status: 400 });
					return;
				}
				const response = await getSelfServiceCheck(code);
				if (!active) return;
				if (response.error) {
					setValidationError({ message: response.message || "No se pudo validar el código.", status: response.status });
				} else {
					setValidatedCode(code);
				}
			} catch {
				if (active) setValidationError({ message: "No se pudo conectar con el servidor. Comprueba tu conexión e inténtalo de nuevo." });
			} finally {
				if (active) setValidating(false);
			}
		};
		void validate();
		return () => { active = false; };
	}, [router.isReady, code]);

	const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || !valid || pendingRef.current) return;
		pendingRef.current = true;
		setReading(true);
		setControlCode("");
		setResult(null);
		setFileName(file.name);
		try {
			const decoded = await readQrControlCode(file);
			if (currentCodeRef.current !== code) return;
			setControlCode(decoded);
		} catch (error) {
			if (currentCodeRef.current === code) {
				setControlCode("");
				enqueueSnackbar(error instanceof Error ? error.message : "No se pudo leer la imagen QR.", { variant: "error" });
			}
		} finally {
			pendingRef.current = false;
			setReading(false);
		}
	};

	const handleRegister = async () => {
		if (!valid || !controlCode || result || pendingRef.current) return;
		pendingRef.current = true;
		setSubmitting(true);
		try {
			const response = await postSelfServiceCheck(code, controlCode);
			if (currentCodeRef.current !== code) return;
			if (response.error) {
				enqueueSnackbar(response.message || "No se pudo registrar la participación.", { variant: "error" });
			} else {
				setResult(response.data);
			}
		} catch {
			if (currentCodeRef.current === code) {
				enqueueSnackbar("No se pudo conectar con el servidor. Puedes volver a intentarlo.", { variant: "error" });
			}
		} finally {
			pendingRef.current = false;
			setSubmitting(false);
		}
	};

	const handleCloseError = () => { void router.replace("/self"); };

	return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Stack spacing={3}>
				<Typography component="h1" variant="h4">Registrar participación</Typography>
				{validating &&
					<Box role="status" sx={{ display: "flex", alignItems: "center", gap: 2 }}>
						<CircularProgress size={24} />
						<Typography>Validando código...</Typography>
					</Box>
				}
				{valid && <>
					<Alert severity="success">Código de participación válido</Alert>
					<Button component="label" variant="contained" startIcon={<UploadFileIcon />} disabled={reading || submitting}>
						{reading ? "Leyendo QR..." : "Subir credencial QR"}
						<input hidden type="file" accept="image/*" onChange={handleFileSelection} disabled={reading || submitting} />
					</Button>
					{reading && <Typography role="status">Leyendo QR...</Typography>}
					{fileName && <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{fileName}</Typography>}
					{controlCode && <Typography sx={{ overflowWrap: "anywhere" }}>Código de control: {controlCode}</Typography>}
					<Button variant="contained" startIcon={<CheckCircleOutlineIcon />} onClick={handleRegister} disabled={!controlCode || reading || submitting || !!result}>
						{submitting ? "Registrando..." : "Registrar participación"}
					</Button>
					{result &&
						<Alert severity="success">
							<Typography>{result.message || "Participación registrada"}</Typography>
							<Typography sx={{ overflowWrap: "anywhere" }}>Código de control: {result.control_code}</Typography>
							<Typography>Puntos: {result.points}</Typography>
						</Alert>
					}
				</>}
				<Button component={Link} href="/self" startIcon={<ArrowBackIcon />}>Volver al inicio</Button>
			</Stack>
			<Dialog open={validationError !== null} onClose={handleCloseError} aria-labelledby="validation-error-title">
				<DialogTitle id="validation-error-title">No se puede validar el código</DialogTitle>
				<DialogContent>
					{validationError?.status === 400 &&
						<DialogContentText sx={{ mb: 2 }}>El código no existe o no está disponible.</DialogContentText>
					}
					<DialogContentText sx={{ overflowWrap: "anywhere" }}>{validationError?.message}</DialogContentText>
				</DialogContent>
				<DialogActions>
					<Button onClick={handleCloseError}>Volver al inicio</Button>
				</DialogActions>
			</Dialog>
		</Container>
	);
}

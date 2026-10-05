import { SelfServiceGift, SelfServiceRedeem } from "@/const";
import { getSelfServiceRewards, postSelfServicePoints, postSelfServiceRedeemReward } from "@/lib/http_self_service";
import { readQrControlCode } from "@/lib/qr";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import DownloadIcon from "@mui/icons-material/Download";
import RedeemIcon from "@mui/icons-material/Redeem";
import RefreshIcon from "@mui/icons-material/Refresh";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import {
	Alert,
	Box,
	Button,
	CircularProgress,
	Container,
	FormControl,
	InputLabel,
	MenuItem,
	Select,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import Link from "next/link";
import { useSnackbar } from "notistack";
import { type ChangeEvent, useEffect, useRef, useState } from "react";

function safeDownloadUrl(value: string): string | undefined {
	if (!value?.trim()) return;
	try {
		const url = new URL(value.trim(), "https://localhost");
		if (url.protocol === "https:" || url.protocol === "http:") return value.trim();
	} catch {}
}

export default function SelfRewardRedeem() {
	const { enqueueSnackbar } = useSnackbar();
	const [rewards, setRewards] = useState<SelfServiceGift[]>([]);
	const [loadingRewards, setLoadingRewards] = useState(true);
	const [catalogError, setCatalogError] = useState("");
	const [reading, setReading] = useState(false);
	const [redeeming, setRedeeming] = useState(false);
	const [refreshing, setRefreshing] = useState(false);
	const [fileName, setFileName] = useState("");
	const [controlCode, setControlCode] = useState("");
	const [points, setPoints] = useState<number | null>(null);
	const [ci, setCI] = useState("");
	const [giftId, setGiftId] = useState("");
	const [redemptions, setRedemptions] = useState<SelfServiceRedeem[]>([]);
	const [redeemedGiftIds, setRedeemedGiftIds] = useState<string[]>([]);
	const pendingRef = useRef(false);
	const availableRewards = rewards.filter(reward => reward.stock > 0);
	const selectedReward = availableRewards.find(reward => reward._id === giftId);
	const busy = loadingRewards || reading || redeeming || refreshing;
	const alreadyRedeemed = !!selectedReward && !selectedReward.multiple && redeemedGiftIds.includes(selectedReward._id);
	const insufficientPoints = !!selectedReward && points !== null && points < selectedReward.points;
	const canRedeem = !busy && !!controlCode && !!ci.trim() && points !== null && !!selectedReward && !insufficientPoints && !alreadyRedeemed;

	useEffect(() => {
		let active = true;
		getSelfServiceRewards().then(response => {
			if (!active) return;
			if (response.error) {
				setCatalogError(response.message || "No se pudieron cargar los premios.");
			} else {
				setRewards(response.data);
			}
		}).catch(() => {
			if (active) setCatalogError("No se pudo conectar con el servidor para cargar los premios.");
		}).finally(() => {
			if (active) setLoadingRewards(false);
		});
		return () => { active = false; };
	}, []);

	const refreshData = async (participantCode: string) => {
		setPoints(null);
		setCatalogError("");
		try {
			const [balanceResponse, rewardsResponse] = await Promise.all([
				participantCode ? postSelfServicePoints(participantCode) : Promise.resolve(null),
				getSelfServiceRewards(),
			]);
			if (balanceResponse?.error) {
				enqueueSnackbar(balanceResponse.message || "No se pudo actualizar el saldo.", { variant: "error" });
			} else if (balanceResponse) {
				setPoints(balanceResponse.data.points);
			}
			if (rewardsResponse.error) {
				setRewards([]);
				setCatalogError(rewardsResponse.message || "No se pudieron actualizar los premios.");
			} else {
				setRewards(rewardsResponse.data);
			}
		} catch {
			setPoints(null);
			setRewards([]);
			setCatalogError("No se pudieron actualizar el saldo y los premios. Actualiza los datos antes de volver a canjear.");
		}
	};

	const handleFileSelection = async (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		event.target.value = "";
		if (!file || pendingRef.current || busy) return;
		pendingRef.current = true;
		setReading(true);
		setControlCode("");
		setPoints(null);
		setCI("");
		setGiftId("");
		setRedemptions([]);
		setRedeemedGiftIds([]);
		setFileName(file.name);
		try {
			const decoded = await readQrControlCode(file);
			const response = await postSelfServicePoints(decoded);
			if (response.error) {
				enqueueSnackbar(response.message || "No se pudieron consultar los puntos.", { variant: "error" });
				return;
			}
			setControlCode(decoded);
			setPoints(response.data.points);
		} catch (error) {
			enqueueSnackbar(error instanceof Error ? error.message : "No se pudo leer el QR ni consultar los puntos.", { variant: "error" });
		} finally {
			pendingRef.current = false;
			setReading(false);
		}
	};

	const handleRefresh = async () => {
		if (pendingRef.current || busy) return;
		pendingRef.current = true;
		setRefreshing(true);
		try {
			await refreshData(controlCode);
		} finally {
			pendingRef.current = false;
			setRefreshing(false);
		}
	};

	const handleRedeem = async () => {
		if (!canRedeem || !selectedReward || pendingRef.current) return;
		pendingRef.current = true;
		setRedeeming(true);
		try {
			const response = await postSelfServiceRedeemReward({ control_code: controlCode, ci: ci.trim(), gift: selectedReward._id });
			if (response.error) {
				enqueueSnackbar(response.message || "No se pudo canjear el premio.", { variant: "error" });
				await refreshData(controlCode);
				return;
			}
			setRedemptions(previous => [response.data, ...previous]);
			setRedeemedGiftIds(previous => [...previous, selectedReward._id]);
			setGiftId("");
			enqueueSnackbar(response.message || "Premio canjeado", { variant: "success" });
			await refreshData(controlCode);
		} catch {
			setPoints(null);
			enqueueSnackbar("No se pudo confirmar el canje. Verifica con el equipo del evento antes de volver a intentarlo.", { variant: "error" });
		} finally {
			pendingRef.current = false;
			setRedeeming(false);
		}
	};

	return (
		<Container maxWidth="sm" sx={{ py: 4 }}>
			<Stack spacing={3}>
				<Typography component="h1" variant="h4">Canje de premios</Typography>
				<Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={busy}>
					{reading ? "Leyendo QR y consultando puntos..." : "Subir credencial QR"}
					<input hidden type="file" accept="image/*" onChange={handleFileSelection} disabled={busy} />
				</Button>
				{fileName && <Typography variant="body2" sx={{ overflowWrap: "anywhere" }}>{fileName}</Typography>}
				{controlCode &&
					<Box sx={{ borderBottom: "1px solid", borderColor: "divider", pb: 2 }}>
						<Typography sx={{ overflowWrap: "anywhere" }}>Código de control: {controlCode}</Typography>
						<Typography color="text.secondary" sx={{ mt: 1 }}>Puntos disponibles</Typography>
						<Typography sx={{ fontSize: 32, fontWeight: 700 }}>{points === null ? "Pendiente de actualizar" : points}</Typography>
					</Box>
				}
				{loadingRewards && <Box role="status" sx={{ display: "flex", gap: 2, alignItems: "center" }}><CircularProgress size={24} /><Typography>Cargando premios...</Typography></Box>}
				{catalogError && <Alert severity="error">{catalogError}</Alert>}
				{!busy && !catalogError && availableRewards.length === 0 && <Alert severity="info">No hay premios disponibles en stock.</Alert>}
				<FormControl fullWidth disabled={busy || availableRewards.length === 0}>
					<InputLabel id="reward-label">Premio</InputLabel>
					<Select labelId="reward-label" id="reward" label="Premio" value={selectedReward ? giftId : ""} onChange={event => setGiftId(event.target.value)}>
						{availableRewards.map(reward => (
							<MenuItem key={reward._id} value={reward._id} disabled={!reward.multiple && redeemedGiftIds.includes(reward._id)} sx={{ whiteSpace: "normal" }}>
								{reward.name} ({reward.points} puntos)
							</MenuItem>
						))}
					</Select>
				</FormControl>
				{selectedReward && <Box>
					{selectedReward.description && <Typography sx={{ mb: 1 }}>{selectedReward.description}</Typography>}
					<Typography variant="body2" color="text.secondary">Stock: {selectedReward.stock} | {selectedReward.multiple ? "Canje múltiple" : "Un canje por participante"}</Typography>
				</Box>}
				{insufficientPoints && selectedReward && points !== null && <Alert severity="warning">Te faltan {selectedReward.points - points} puntos para este premio.</Alert>}
				{alreadyRedeemed && <Alert severity="info">Ya canjeaste este premio.</Alert>}
				<TextField id="reward-ci" label="Carnet de Identidad" value={ci} onChange={event => setCI(event.target.value)} disabled={busy || !controlCode} fullWidth required />
				<Button variant="contained" startIcon={<RedeemIcon />} onClick={handleRedeem} disabled={!canRedeem}>
					{redeeming ? "Canjeando..." : "Canjear premio"}
				</Button>
				<Button variant="outlined" startIcon={<RefreshIcon />} onClick={handleRefresh} disabled={busy}>
					{refreshing ? "Actualizando..." : "Actualizar puntos y premios"}
				</Button>
				{redemptions.length > 0 &&
					<Box component="section" aria-labelledby="redemptions-title" sx={{ borderTop: "1px solid", borderColor: "divider", pt: 3 }}>
						<Typography id="redemptions-title" component="h2" variant="h6" sx={{ mb: 2 }}>Premios canjeados</Typography>
						{redemptions.map((redemption, index) => {
							const downloadUrl = safeDownloadUrl(redemption.download_url);
							return <Stack key={index} spacing={1} sx={{ py: 2, borderBottom: "1px solid", borderColor: "divider" }}>
								<Typography component="h3" sx={{ fontSize: 18, fontWeight: 700 }}>{redemption.product_name}</Typography>
								{redemption.message && <Typography>{redemption.message}</Typography>}
								{redemption.discount_code && <TextField label="Código de descuento" value={redemption.discount_code} InputProps={{ readOnly: true }} fullWidth />}
								{downloadUrl && <Button component="a" href={downloadUrl} target="_blank" rel="noopener noreferrer" variant="outlined" startIcon={<DownloadIcon />}>Descargar premio</Button>}
							</Stack>;
						})}
					</Box>
				}
				<Button component={Link} href="/self" startIcon={<ArrowBackIcon />}>Volver al inicio</Button>
			</Stack>
		</Container>
	);
}

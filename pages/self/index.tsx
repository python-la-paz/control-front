import {
	Accordion,
	AccordionDetails,
	AccordionSummary,
	Box,
	ButtonBase,
	Container,
	Typography,
} from "@mui/material";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import HowToRegIcon from "@mui/icons-material/HowToReg";
import EventAvailableIcon from "@mui/icons-material/EventAvailable";
import RedeemIcon from "@mui/icons-material/Redeem";
import PointOfSaleIcon from '@mui/icons-material/PointOfSale';
import Head from "next/head";
import Link from "next/link";
import { useState } from "react";
import ParticipationDialog from "@/components/participation-dialog";

const frequentlyAskedQuestions = [
	{
		question: "¿Qué necesito para acreditarme?",
		answer: "Tu carnet de identidad y tu fecha de nacimiento. Ingresa ambos datos en el formulario de acreditación.",
	},
	{
		question: "¿Cómo obtengo mi credencial QR?",
		answer: "Al completar la acreditación, aparecerán tu código de control y tu credencial QR. Puedes guardarla con el botón Descargar Credencial QR.",
	},
	{
		question: "¿Cómo obtengo los códigos o enlaces de participación?",
		answer: "Los códigos y enlaces de participación se proporcionan durante las charlas y talleres. Usa el enlace recibido o ingresa el código en Participación y sube tu credencial QR para registrar tu participación y ganar puntos.",
	},
	{
		question: "¿Dónde puedo canjear mis puntos?",
		answer: "En Canje de puntos puedes subir tu credencial QR, consultar tu saldo y seleccionar un producto disponible. Ingresa tu carnet de identidad para completar el canje. Debes tener los puntos necesarios para el producto elegido.",
	},
	{
		question: "¿Puedo canjear un regalo especial?",
		answer: "Sí, durante el evento puedes canjear un regalo especial desde Canje de regalos, sujeto a disponibilidad. Sube tu credencial QR e ingresa tu carnet de identidad. El regalo especial está limitado a uno por persona.",
	},
	{
		question: "¿Qué hago si la acreditación falla?",
		answer: "Comprueba tu carnet de identidad, tu fecha de nacimiento y tu conexión antes de volver a intentarlo. Si el problema continúa, escribe a hello@pylapaz.org.",
	},
	{
		question: "¿Dónde puedo pedir ayuda si tengo algún problema?",
		answer: "Escribe a hello@pylapaz.org si tienes problemas con la acreditación, el registro de participación o el canje de productos y regalos.",
	},
];

const accessOptions = [
	{ title: "Acreditación", description: "Tu credencial de acceso al evento para participar y ganar puntos", icon: HowToRegIcon, color: "#176b5b", background: "#eaf6f1", href: "/self/acreditation" },
    { title: "Participación", description: "Registra tu participación con el código de la actividad", icon: EventAvailableIcon, color: "#215b8c", background: "#eaf2fa", href: undefined },
    
	{ title: "Canje de puntos", description: "Canjea tus puntos por premios", icon: PointOfSaleIcon, color: "#9a4b15", background: "#fff3e2", href: "/self/redeem/reward" },
    { title: "Canje de regalos", description: "Canjea tu regalo especial", icon: RedeemIcon, color: "#6b3a9a", background: "#f3e8ff", href: "/self/redeem/gift" }
];

export default function SelfHome() {
	const [participationOpen, setParticipationOpen] = useState(false);

	const handleOpenParticipation = () => {
		setParticipationOpen(true);
	};

	return (
		<>
			<Head>
				<title>PyDay La Paz | Autoservicio</title>
			</Head>
			<Box component="main" sx={{ pb: { xs: 4, md: 6 } }}>
				<Box
					component="header"
					sx={{
						color: "#ffffff",
						backgroundColor: "#233a32",
						backgroundImage: 'linear-gradient(90deg, rgba(12, 30, 24, 0.88), rgba(12, 30, 24, 0.45)), url("/banner.png")',
						backgroundSize: "cover",
						backgroundPosition: "center",
						py: { xs: 4, md: 5 },
					}}
				>
					<Container maxWidth="md">
						<Typography component="h1" sx={{ fontSize: { xs: 32, md: 44 }, fontWeight: 700, letterSpacing: 0, lineHeight: 1.2 }}>
							PyDay La Paz
						</Typography>
						<Typography sx={{ mt: 1.5, fontSize: { xs: 18, md: 22 } }}>
							Autoservicio para participantes
						</Typography>
					</Container>
				</Box>
				<Container maxWidth="md">
					<Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, minmax(0, 1fr))" }, gap: 2, py: { xs: 3, md: 4 } }}>
						{accessOptions.map(({ title, description, icon: Icon, color, background, href }) => (
							<ButtonBase
								key={title}
								component={href ? Link : "button"}
								{...(href ? { href } : { onClick: handleOpenParticipation, "aria-haspopup": "dialog" as const })}
								sx={{
									p: 3,
									minHeight: 144,
									gap: 2,
									justifyContent: "flex-start",
									textAlign: "left",
									border: "1px solid #dce3df",
									borderRadius: 2,
									color: "#202a25",
									backgroundColor: "#ffffff",
									"&:hover": { borderColor: color, backgroundColor: background },
									"&.Mui-focusVisible": { outline: `3px solid ${color}`, outlineOffset: 3 },
								}}
							>
								<Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", width: 48, height: 48, flexShrink: 0, borderRadius: 1, backgroundColor: background, color }}>
									<Icon sx={{ fontSize: 28 }} />
								</Box>
								<Box sx={{ flex: 1, minWidth: 0 }}>
									<Typography component="h2" sx={{ fontSize: 21, fontWeight: 700, overflowWrap: "anywhere" }}>{title}</Typography>
									<Typography sx={{ mt: 0.5, fontSize: 14, color: "#58655d" }}>{description}</Typography>
								</Box>
								<ArrowForwardIcon sx={{ color, flexShrink: 0 }} />
							</ButtonBase>
						))}
					</Box>
					<Box component="section" aria-labelledby="help-title" sx={{ borderTop: "1px solid #dce3df", pt: 3 }}>
						<Box sx={{ display: "flex", gap: 1, alignItems: "center", mb: 2 }}>
							<HelpOutlineIcon sx={{ color: "#176b5b" }} />
							<Typography id="help-title" component="h2" sx={{ fontSize: 24, fontWeight: 700 }}>Preguntas frecuentes</Typography>
						</Box>
						{frequentlyAskedQuestions.map(({ question, answer }, index) => (
							<Accordion key={question} disableGutters elevation={0} sx={{ borderBottom: "1px solid #dce3df", "&::before": { display: "none" } }}>
								<AccordionSummary expandIcon={<ExpandMoreIcon />} id={`help-question-${index}`} aria-controls={`help-answer-${index}`} sx={{ px: 0, minHeight: 60 }}>
									<Typography component="h3" sx={{ fontSize: 16, fontWeight: 500 }}>{question}</Typography>
								</AccordionSummary>
								<AccordionDetails sx={{ px: 0, pt: 0, pb: 2 }}>
									<Typography sx={{ color: "#58655d", lineHeight: 1.7 }}>{answer}</Typography>
								</AccordionDetails>
							</Accordion>
						))}
					</Box>
				</Container>
			</Box>
			<ParticipationDialog open={participationOpen} onClose={() => setParticipationOpen(false)} />
		</>
	);
}

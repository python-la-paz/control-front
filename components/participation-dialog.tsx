import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { useRouter } from "next/router";
import { type FormEvent, useEffect, useId, useRef, useState } from "react";

export default function ParticipationDialog({ open, onClose }: { open: boolean, onClose: () => void }) {
  const router = useRouter();
  const id = useId();
  const [code, setCode] = useState("");
  const [navigating, setNavigating] = useState(false);
  const [error, setError] = useState("");
  const pendingRef = useRef(false);

  useEffect(() => {
    if (open) {
      setCode("");
      setError("");
    }
  }, [open]);

  const handleClose = () => {
    if (!pendingRef.current) onClose();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const participationCode = code.trim();
    if (!participationCode || pendingRef.current) return;
    pendingRef.current = true;
    setNavigating(true);
    setError("");
    try {
      const changed = await router.push(`/self/check/${encodeURIComponent(participationCode)}`);
      if (changed) onClose();
    } catch {
      setError("No se pudo abrir la participación. Inténtalo de nuevo.");
    } finally {
      pendingRef.current = false;
      setNavigating(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs" aria-labelledby={`${id}-title`}>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogTitle id={`${id}-title`}>Participación</DialogTitle>
        <DialogContent>
          <TextField
            id={`${id}-code`}
            label="Código de participación"
            value={code}
            onChange={event => { setCode(event.target.value); setError(""); }}
            disabled={navigating}
            error={!!error}
            helperText={error}
            autoFocus
            fullWidth
            required
            margin="dense"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} disabled={navigating}>Cancelar</Button>
          <Button type="submit" variant="contained" disabled={!code.trim() || navigating}>
            {navigating ? "Abriendo..." : "Aceptar"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
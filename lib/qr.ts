export async function readQrControlCode(file: File): Promise<string> {
    const { default: jsQR } = await import("jsqr");
    const url = URL.createObjectURL(file);
    let text = "";
    try {
        const image = new Image();
        image.src = url;
        await image.decode();
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d", { willReadFrequently: true });
        if (!context) throw new Error("No se pudo procesar la imagen.");
        const maxDimension = Math.max(image.naturalWidth, image.naturalHeight);
        if (!maxDimension) throw new Error("La imagen está vacía.");
        const sizes = new Set([Math.min(maxDimension, 2048), Math.min(maxDimension, 1024), Math.min(maxDimension, 512)]);
        for (const size of Array.from(sizes)) {
            const scale = size / maxDimension;
            canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
            canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
            context.imageSmoothingEnabled = false;
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
            const decoded = jsQR(pixels.data, pixels.width, pixels.height, { inversionAttempts: "attemptBoth" });
            if (decoded?.data.trim()) {
                text = decoded.data.trim();
                break;
            }
        }
        if (!text) throw new Error("No se detectó un QR legible. Prueba con la imagen original de tu credencial, sin recortes ni capturas borrosas.");
    } finally {
        URL.revokeObjectURL(url);
    }
    if (text.startsWith("{")) {
        const data: unknown = JSON.parse(text);
        if (!data || typeof data !== "object" || !("control_code" in data) || typeof data.control_code !== "string" || !data.control_code.trim()) {
            throw new Error("El QR no contiene un código de control válido.");
        }
        return data.control_code.trim();
    }
    return text;
}
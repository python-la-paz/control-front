import { ComboProps, GiftProps, LocationProps, ParticipantProps, ParticipantRedeemCombosProps, PresentationProps } from "@/const";

export async function postLogin(formData: FormData): Promise<Response> {
    return await fetch(process.env.NEXT_PUBLIC_API_URL + "/api/v1/auth/token", {
        method: 'POST',
        body: formData,
        redirect: 'follow'
    })
}

export async function postRegistration(access_token: string, data: { ci: string, control_code: string }): Promise<{ message?: any, error: boolean }> {
    try {
        const queryArray = Object.keys(data).reduce((prev: string[], item) => {
            const value = data[item as keyof typeof data];
            if (value) {
                prev.push(`${item}=${value}`);
            }
            return prev;
        }, []);
        const res = await fetch(`/api/v1/participant/registration?${queryArray.join(`&`)}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true }
        }
        return { message: "Participante Registrado", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}

export async function getLocations(access_token: string): Promise<{ data: LocationProps[], message?: string, error: boolean }> {
    const res = await fetch(`/api/v1/location`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        },
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: [], message: `${res.status} - ${error}`, error: true }
    }
    const data = await res.json();
    return { data, error: false };
}

export async function postCheckInOut(access_token: string, data: { participant_control_code: string, location_id: string, check: boolean }): Promise<{ message?: any, error: boolean }> {
    try {
        const queryArray = Object.keys(data).reduce((prev: string[], item) => {
            const value = data[item as keyof typeof data];
            if (value !== undefined) {
                prev.push(`${item}=${value}`);
            }
            return prev;
        }, []);
        const res = await fetch(`/api/v1/control?${queryArray.join(`&`)}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true }
        }
        return { message: data.check ? "Ingreso Permitido" : "Salida Permitida", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}

export async function postRedeemMeal(access_token: string, data: { participant_control_code: string }): Promise<{ message?: any, error: boolean }> {
    try {
        const queryArray = Object.keys(data).reduce((prev: string[], item) => {
            const value = data[item as keyof typeof data];
            if (value !== undefined) {
                prev.push(`${item}=${value}`);
            }
            return prev;
        }, []);
        const res = await fetch(`/api/v1/meals/redeem/user?${queryArray.join(`&`)}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true }
        }
        return { message: "Entrega Registrada", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}

export async function getPresentations(access_token: string): Promise<{ data: PresentationProps[], message?: string, error: boolean }> {
    const res = await fetch(`/api/v1/presentation`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        },
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: [], message: `${res.status} - ${error}`, error: true }
    }
    const data = await res.json();
    return { data, error: false };
}

export async function getPresentationsTalks(access_token: string): Promise<{ data: PresentationProps[], message?: string, error: boolean }> {
    const res = await fetch(`/api/v1/presentation/get/talks`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        },
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: [], message: `${res.status} - ${error}`, error: true }
    }
    const data = await res.json();
    return { data, error: false };
}

export async function postObtainPoints(access_token: string, data: { participant_control_code: string, presentation_id: string }): Promise<{ message?: any, error: boolean }> {
    try {
        const queryArray = Object.keys(data).reduce((prev: string[], item) => {
            const value = data[item as keyof typeof data];
            if (value !== undefined) {
                prev.push(`${item}=${value}`);
            }
            return prev;
        }, []);
        const res = await fetch(`/api/v1/points/obtain?${queryArray.join(`&`)}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true }
        }
        return { message: "Puntos Reclamados", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}

export async function postObtainPointsParticipation(access_token: string, data: { participant_control_code: string, presentation_id: string }): Promise<{ message?: any, error: boolean }> {
    try {
        const queryArray = Object.keys(data).reduce((prev: string[], item) => {
            const value = data[item as keyof typeof data];
            if (value !== undefined) {
                prev.push(`${item}=${value}`);
            }
            return prev;
        }, []);
        const res = await fetch(`/api/v1/points/participation?${queryArray.join(`&`)}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true }
        }
        return { message: "Participación Registrada", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}


export async function getGifts(access_token: string): Promise<{ data: GiftProps[], message?: string, error: boolean }> {
    const res = await fetch(`/api/v1/gift/products`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        },
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: [], message: `${res.status} - ${error}`, error: true }
    }
    const data = await res.json();
    return { data, error: false };
}

export async function postRedeemGift(access_token: string, data: { participant_control_code: string, gift_id: string }): Promise<{ message?: any, error: boolean }> {
    try {
        const queryArray = Object.keys(data).reduce((prev: string[], item) => {
            const value = data[item as keyof typeof data];
            if (value !== undefined) {
                prev.push(`${item}=${value}`);
            }
            return prev;
        }, []);
        const res = await fetch(`/api/v1/gift/redeem/user?${queryArray.join(`&`)}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true }
        }
        return { message: "Regalo Canjeado", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}

export async function getParticipantByControlCode(access_token: string, data: { participant_control_code: string }): Promise<{ data: ParticipantProps, message?: string, error: boolean }> {
    const queryArray = Object.keys(data).reduce((prev: string[], item) => {
        const value = data[item as keyof typeof data];
        if (value !== undefined) {
            prev.push(`${item}=${value}`);
        }
        return prev;
    }, []);
    const res = await fetch(`/api/v1/participant/user/code?${queryArray.join(`&`)}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        },
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as ParticipantProps, message: `${res.status} - ${error}`, error: true }
    }
    const data_fetch = await res.json();
    return { data: data_fetch, error: false };
}

export async function getParticipantByCi(access_token: string, data: { ci: string }): Promise<{ data: ParticipantProps, message?: string, error: boolean }> {
    const queryArray = Object.keys(data).reduce((prev: string[], item) => {
        const value = data[item as keyof typeof data];
        if (value !== undefined) {
            prev.push(`${item}=${value}`);
        }
        return prev;
    }, []);
    const res = await fetch(`/api/v1/participant/user/ci?${queryArray.join(`&`)}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        },
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as ParticipantProps, message: `${res.status} - ${error}`, error: true }
    }
    const data_fetch = await res.json();
    return { data: data_fetch, error: false };
}

export async function getParticipantRedeemCombos(access_token: string, data: { participant_control_code: string }): Promise<{ data: ParticipantRedeemCombosProps[], message?: string, error: boolean }> {
    const queryArray = Object.keys(data).reduce((prev: string[], item) => {
        const value = data[item as keyof typeof data];
        if (value !== undefined) {
            prev.push(`${item}=${value}`);
        }
        return prev;
    }, []);
    const res = await fetch(`/api/v1/combo/redeem/user/code?${queryArray.join(`&`)}`, {
        method: 'GET',
        headers: {
            "Authorization": `Bearer ${access_token}`,
        },
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: [], message: `${res.status} - ${error}`, error: true }
    }
    const data_fetch = await res.json();
    return { data: data_fetch, error: false };
}

export async function postGetCombosList(access_token: string, data: string[]): Promise<{ data: ComboProps[], message?: string, error: boolean }> {
    try {
        const res = await fetch(`/api/v1/combo/products`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "content-type": "application/json"
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { data: [], message: `${res.status} - ${error}`, error: true }
        }
        const data_fetch = await res.json();
        return { data: data_fetch, error: false };

    } catch (error: any) {
        return { data: [], message: error.message, error: true };
    }
}

export async function postRedeemCombo(access_token: string, data: { participant_control_code: string, combo_id: string, products_id: string[] }): Promise<{ message?: any, error: boolean }> {
    try {
        
        const res = await fetch(`/api/v1/combo/redeem/user`, {
            method: 'POST',
            body: JSON.stringify(data),
            headers: {
                "Authorization": `Bearer ${access_token}`,
                "content-type": "application/json"
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true }
        }
        return { message: "Regalo Canjeado", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}
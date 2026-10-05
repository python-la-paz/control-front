import { SelfServiceGift, SelfServiceParticipant, SelfServiceRedeem, SelfServiceRegisterRequest, SelfServiceResult } from "@/const";

export async function postSelfServiceRegistration(register: SelfServiceRegisterRequest): Promise<{ data: SelfServiceParticipant, message?: string, error: boolean }> {
    const res = await fetch(`/api/v1/self-service/registration`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(register),
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as SelfServiceParticipant, message: `${res.status} - ${error}`, error: true }
    }
    const data = await res.json();
    const participant: SelfServiceParticipant = data;

    return { data: participant, error: false, message: "Registro exitoso" }
}

export async function getSelfServiceCheck(code: string): Promise<{ error: boolean, status: number, message?: string }> {
    const res = await fetch(`/api/v1/self-service/check/${encodeURIComponent(code)}`, {
        method: 'GET',
        cache: 'no-store',
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { error: true, status: res.status, message: `${res.status} - ${error}` };
    }
    return { error: false, status: res.status };
}

export async function postSelfServiceCheck(code: string, controlCode: string): Promise<{ data: SelfServiceResult, error: boolean, message?: string }> {
    const res = await fetch(`/api/v1/self-service/check/${encodeURIComponent(code)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ control_code: controlCode }),
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as SelfServiceResult, error: true, message: `${res.status} - ${error}` };
    }
    const data: SelfServiceResult = await res.json();
    return { data, error: false, message: data.message };
}

export async function postSelfServicePoints(controlCode: string): Promise<{ data: SelfServiceResult, error: boolean, message?: string }> {
    const res = await fetch('/api/v1/self-service/points', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ control_code: controlCode }),
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as SelfServiceResult, error: true, message: `${res.status} - ${error}` };
    }
    const data: SelfServiceResult = await res.json();
    return { data, error: false, message: data.message };
}

export async function getSelfServiceRewards(): Promise<{ data: SelfServiceGift[], error: boolean, message?: string }> {
    const res = await fetch('/api/v1/self-service/rewards', { method: 'GET', cache: 'no-store' });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: [], error: true, message: `${res.status} - ${error}` };
    }
    const data: SelfServiceGift[] = await res.json();
    return { data, error: false };
}

export async function postSelfServiceRedeemReward(reward: { control_code: string, ci: string, gift: string }): Promise<{ data: SelfServiceRedeem, error: boolean, message?: string }> {
    const res = await fetch('/api/v1/self-service/redeem/reward', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reward),
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as SelfServiceRedeem, error: true, message: `${res.status} - ${error}` };
    }
    const data: SelfServiceRedeem = await res.json();
    return { data, error: false, message: data.message };
}

export async function getSelfServiceGift(): Promise<{ data: SelfServiceResult, error: boolean, message?: string }> {
    const res = await fetch('/api/v1/self-service/redeem/gift', { method: 'GET', cache: 'no-store' });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as SelfServiceResult, error: true, message: `${res.status} - ${error}` };
    }
    const data: SelfServiceResult = await res.json();
    return { data, error: false, message: data.message };
}

export async function postSelfServiceRedeemGift(gift: { control_code: string, ci: string }): Promise<{ data: SelfServiceRedeem, error: boolean, message?: string }> {
    const res = await fetch('/api/v1/self-service/redeem/gift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ control_code: gift.control_code, ci: gift.ci, gift: null }),
    });
    if (res.status !== 200) {
        const error = await res.text();
        return { data: {} as SelfServiceRedeem, error: true, message: `${res.status} - ${error}` };
    }
    const data: SelfServiceRedeem = await res.json();
    return { data, error: false, message: data.message };
}
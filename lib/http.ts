export async function postRegistration(access_token: string, data: { ci: string, control_code: string }): Promise<{ message?: any, error: boolean }> {
    try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL
        //   const  {_id , ...recipeData }  = recipe;
        //   const response = await axios.post(`${API_URL}/recipe/user/public`, recipeData, { "headers": { "Authorization": `Bearer ${access_token}` } });
        // if (response.status !== 201) {
        //     throw new Error(`${response.status} - ${response.data}`);
        // }
        // return { message: "" };
        const queryArray = Object.keys(data).reduce((prev: string[], item) => {
            const value = data[item as keyof typeof data];
            if (value) {
                prev.push(`${item}=${value}`);
            }
            return prev;
        }, []);
        const res = await fetch(`api/v1/participant/registration?${queryArray.join(`&`)}`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${access_token}`,
            },
        })
        if (res.status !== 200) {
            const error = await res.text();
            return { message: `${res.status} - ${error}`, error: true}
        }
        return { message: "Participante Registrado", error: false };

    } catch (error: any) {
        return { message: error.message, error: true };
    }
}

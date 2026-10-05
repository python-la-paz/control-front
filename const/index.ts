
export type LocationProps = {
    _id: string;
    name: string;
    value: string;
};

export type SpecialPointProps = {
    _id: string;
    description: string;
    points: number;
};

export type PresentationProps = {
    _id: string;
    name: string;
    kind: string;
};
export type GiftProps = {
    _id: string;
    product: string;
    product_name: string;
    points: number;
}
export type ParticipantProps = {
    _id: string;
    name: string;
    ci: string;
    control_code: string;
    combos: string[];
    locations: string[];
    combos_items: string[];
    locations_items: string[];
    points: number;
    mail: string;
    phone: string;
    food_restriction: string;
    gender: string;
    t_shirt_size: string;
    registration: boolean
}

export type ProductProps = {
    _id: string;
    name: string;
    disabled?: boolean;
}

export type ComboProps = {
    _id: string;
    name: string;
    products: string[];
    products_items: ProductProps[];
}

export type ParticipantRedeemCombosProps = {
    _id: string;
    participant_control_code: string;
    combo: string;
    products: string[];
}

export type SelfServiceRegisterRequest = {
    ci: string;
    birthday: string;
}

export type SelfServiceParticipant = {
    _id: string;
    control_code: string;
    qr_code: string;
}

export type SelfServiceResult = {
    control_code: string;
    message: string;
    points: number;
}

export type SelfServiceGift = {
    _id: string;
    name: string;
    description: string;
    kind: string;
    points: number;
    multiple: boolean;
    stock: number;
}

export type SelfServiceRedeem = {
    control_code: string;
    message: string;
    points: number;
    product_name: string;
    discount_code: string;
    download_url: string;
}

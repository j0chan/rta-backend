export class Review {
    review_id: number;
    store_id: number;
    user_id: number;
    content: string;
    keywords: string;
    created_at: Date;
    updated_at: Date;
    isModified: boolean;
}

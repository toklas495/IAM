export interface CredSchema{
    id:string
    user_id:string
    password_hash:string
    last_used_at:string|null
    created_at:Date
    updated_at:Date
}
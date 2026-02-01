export interface RefreshSchema{
   id:string;
   session_id:string;
   token:string;
   expires_at:Date;
   revoked:false|true;
   revoked_at:Date;
   rotation:number;
   created_at:Date;
   updated_at:Date; 
}

export type RefreshOptionSchema = {
    session_id:string;
    token:string;
    expires_at?:Date;
}
export interface UserSchema{
    id:string;
    username?:string;
    email:string;
    email_verified:true|false,
    full_name?:string;
    createdAt:Date;
    updatedAt:Date;
    is_active:true|false; 
    avatar?:string   
}

export interface CreateUserDTO{
    username:string,
    email:string,
    full_name:string|null,
    password:string
}


import { Schema, model, Types } from 'mongoose';
import type{ UserSchema as UserDocument } from '../../../type/user/schema.type.js';

const UserSchema = new Schema<UserDocument>({

    username: {
        type: String,
        lowercase: true,
        trim: true,
        index: true,
    },
    email: {
        type: String,
        lowercase: true,
        trim: true
    },
    emailVerifiedAt: {
        type: Date,
        default: null,
    },
    avatarUrl: {
        type:String,
        default:null
    },
    status: {
        type: String,
        enum: ["active", "suspended", "deleted"],
        default: "active",
        index: true,
    },
    lastLoginAt: Date,
    metadata: {
        type: Schema.Types.Mixed
    }
}, {
    timestamps: true,
    versionKey: false
})

UserSchema.index({ email: 1 }, { unique: true, sparse: true });


export const User = model("User",UserSchema);
import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserBlink extends Document {
    name: string;
    orgname: string;
    email: string;
    amount: number,
    duration:'month' | 'year',
    UserPubKey: string;
}

const UserBlinkSchema: Schema<IUserBlink> = new Schema({
    name: { type: String, required: true },
    orgname: { type: String, required: true },
    email: { type: String, required: true },
    amount :{type:Number,required:true},
    duration:{type:String, enum:['month' , 'year'],required:true},
    UserPubKey: { type: String, required: true },
});

export const UserBlink: Model<IUserBlink> =
    mongoose.models.UserBlink || mongoose.model<IUserBlink>('UserBlink', UserBlinkSchema);

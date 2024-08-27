import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserBlink extends Document {
    name: string;
    orgId: string;
    email: string;
    amount: number,
    duration:'month' | 'year',
    UserPubKey: string;
}

const UserBlinkSchema: Schema<IUserBlink> = new Schema({
    name: { type: String, required: true },
    orgId: { type: String, required: true },
    email: { type: String, required: true },
    amount :{type:Number,required:true},
    duration:{type:String, enum:['month' , 'year'],required:true},
    UserPubKey: { type: String, required: true },
});

const userBlink = mongoose.models.userdata || mongoose.model<IUserBlink>('userdata', UserBlinkSchema);

export default userBlink;
    

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IUserBlink extends Document {
    userId: string;
    name: string;
    orgId: string;
    email: string;
    amount: number,
    duration:'month' | 'year',
    UserPubKey: string;
}

const UserBlinkSchema: Schema<IUserBlink> = new Schema({
    userId: { type: String, required: true },
    name: { type: String, required: true },
    orgId: { type: String, required: true },
    email: { type: String, required: true },
    amount :{type:Number,required:true},
    duration:{type:String, enum:['month' , 'year'],required:true},
    UserPubKey: { type: String, required: true },
});

const userBlink = mongoose.models.persondata || mongoose.model<IUserBlink>('persondata', UserBlinkSchema);

export default userBlink;
    

import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IOrgBlink extends Document {
    name: string;
    email: string;
    month: number;
    year: number;
    orgPubKey: string;
}

const OrgBlinkSchema: Schema<IOrgBlink> = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    orgPubKey: { type: String, required: true },
});

export const OrgBlink: Model<IOrgBlink> =
    mongoose.models.OrgBlink || mongoose.model<IOrgBlink>('OrgBlink', OrgBlinkSchema);

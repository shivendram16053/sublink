import mongoose, { Schema } from 'mongoose';

const OrgBlinkSchema: Schema = new Schema({
    org: { type: String, required: true },
    orgPrivateId: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    website: { type: String, required: false },  // Added
    discord: { type: String, required: false },  // Added
    twitter: { type: String, required: false },  // Added
    feesType: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    orgPubKey: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },  // Optional: Track creation time
});

// Check if the model is already compiled
const OrgData = mongoose.models.Projectts || mongoose.model('Projectts', OrgBlinkSchema);

export default OrgData;

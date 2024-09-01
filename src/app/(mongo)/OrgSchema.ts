import mongoose, { Schema } from 'mongoose';

const OrgBlinkSchema: Schema= new Schema({
    org: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    type: { type: String, required: true },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    orgPubKey: { type: String, required: true },
});

// Check if the model is already compiled
const OrgData = mongoose.models.projectData || mongoose.model('projectData', OrgBlinkSchema);

export default OrgData;

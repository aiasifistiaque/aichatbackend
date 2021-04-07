import mongoose from 'mongoose';

const testSchema = new mongoose.Schema(
	{
		displayName: {
			type: String,
			required: true,
			trim: true,
		},
	},
	{
		timestamps: true,
	}
);

const Test = mongoose.model('Test', testSchema);

export default Test;

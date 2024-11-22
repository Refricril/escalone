import mongoose, { Schema, Document } from 'mongoose';

export interface ICard {
  id: number;
  title: string;
  description: string;
  fields: { [key: string]: any };
  stageId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStage {
  id: number;
  name: string;
  order: number;
  cards: ICard[];
  fieldConfig: {
    inheritFields: boolean;
    requiredFields: string[];
    hiddenFields: string[];
  };
}

export interface IFlow extends Document {
  name: string;
  description: string;
  stages: IStage[];
  createdAt: Date;
  updatedAt: Date;
}

const CardSchema = new Schema<ICard>({
  id: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String },
  fields: { type: Schema.Types.Mixed },
  stageId: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const StageSchema = new Schema<IStage>({
  id: { type: Number, required: true },
  name: { type: String, required: true },
  order: { type: Number, required: true },
  cards: [CardSchema],
  fieldConfig: {
    inheritFields: { type: Boolean, default: true },
    requiredFields: { type: [String], default: [] },
    hiddenFields: { type: [String], default: [] }
  }
});

const FlowSchema = new Schema<IFlow>({
  name: { type: String, required: true },
  description: { type: String },
  stages: [StageSchema],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export default mongoose.models.Flow || mongoose.model<IFlow>('Flow', FlowSchema);

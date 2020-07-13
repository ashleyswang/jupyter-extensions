import { requestAPI } from './api_request';

export type ModelType = 'OTHER' | 'TABLE' | 'IMAGE';

export interface Model {
  id: string; // Resource name of dataset
  displayName: string;
  pipelineId: string;
  createTime: Date;
  updateTime: Date;
  etag: string;
  modelType: string;
}

export interface Models {
  models: Model[];
}

export interface Pipeline {
  id: string;
  displayName: string;
  createTime: Date;
  updateTime: Date;
  elapsedTime: number;
  datasetId: string;
  trainBudgetMilliNodeHours: number | null;
  budgetMilliNodeHours: number | null;
  targetColumn: string | null;
  transformationOptions: any | null;
  predictionType: string | null;
  optimizationObjective: string | null;
}

export interface ModelMetrics {
  confidenceThreshold: number;
  f1Score: number | string;
  f1ScoreAt1: number | string;
  precision: number | string;
  precisionAt1: number | string;
  recall: number | string;
  recallAt1: number | string;
  trueNegativeCount: number | string;
  truePositiveCount: number | string;
  falseNegativeCount: number | string;
  falsePositiveCount: number | string;
  falsePositiveRate: number | string;
  falsePositiveRateAt1: number | string;
}

export interface ModelEvaluation {
  auPrc: number;
  auRoc: number;
  logLoss: number;
  confidenceMetrics: ModelMetrics[];
  createTime: Date;
  featureImportance: any[];
  confusionMatrix: any[];
}

export abstract class ModelService {
  static async listModels(): Promise<Model[]> {
    const data = (await requestAPI<Models>('v1/models')).models;
    return data;
  }

  static async deleteModel(modelId: string): Promise<void> {
    const body = {
      modelId: modelId,
    };
    const requestInit: RequestInit = {
      body: JSON.stringify(body),
      method: 'POST',
    };
    await requestAPI('v1/deleteModel', requestInit);
  }

  static async getPipeline(pipelineId: string): Promise<Pipeline> {
    const query = '?pipelineId=' + pipelineId;
    const data = await requestAPI<Pipeline>('v1/pipeline' + query);
    return data;
  }

  static async listModelEvaluations(modelId: string): Promise<ModelEvaluation> {
    const query = '?modelId=' + modelId;
    const data = await requestAPI<ModelEvaluation>(
      'v1/modelEvaluation' + query
    );
    return data;
  }
}

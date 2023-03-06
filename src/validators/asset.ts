import Joi from 'joi';

const CREATE_ASSET_SCHEMA = Joi.object({
  original: Joi.string().required(),
});

const GET_ASSETS_SCHEMA = Joi.object({
  publicKeys: Joi.array().items(Joi.string()),
});

const UPDATE_ASSET_SCHEMA = Joi.object({
  original: Joi.string().required(),
});

const validateCreateAssetSchema = (data: any): boolean => {
  const { error } = CREATE_ASSET_SCHEMA.validate(data);

  if (error) throw new Error(error?.details[0].message);

  return true;
};

const validateGetAssetsSchema = (data: any): boolean => {
  const { error } = GET_ASSETS_SCHEMA.validate(data);

  if (error) throw new Error(error?.details[0].message);

  return true;
};

const validateUpdateAssetSchema = (data: any): boolean => {
  const { error } = UPDATE_ASSET_SCHEMA.validate(data);

  if (error) throw new Error(error?.details[0].message);

  return true;
};

export { validateCreateAssetSchema, validateGetAssetsSchema, validateUpdateAssetSchema };

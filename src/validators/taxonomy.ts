import Joi from 'joi';

const CREATE_TAXONOMY_SCHEMA = Joi.object({
  label: Joi.string().required(),
  parent: Joi.string(),
});

const GET_TAXONOMIES_SCHEMA = Joi.object({
  publicKeys: Joi.array().items(Joi.string()),
});

const CREATE_UPDATE_SCHEMA = Joi.object({
  label: Joi.string().required(),
  parent: Joi.string(),
});

const validateCreateTaxonomySchema = (data: any): boolean => {
  const { error } = CREATE_TAXONOMY_SCHEMA.validate(data);

  if (error) throw new Error(error?.details[0].message);

  return true;
};

const validateGetTaxonomiesSchema = (data: any): boolean => {
  const { error } = GET_TAXONOMIES_SCHEMA.validate(data);

  if (error) throw new Error(error?.details[0].message);

  return true;
};

const validateUpdateTaxonomySchema = (data: any): boolean => {
  const { error } = CREATE_UPDATE_SCHEMA.validate(data);

  if (error) throw new Error(error?.details[0].message);

  return true;
};

export { validateCreateTaxonomySchema, validateGetTaxonomiesSchema, validateUpdateTaxonomySchema };

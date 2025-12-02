module.exports = {
  '*.{js,jsx,ts,tsx}': [
    'prettier --write',
    'eslint --fix',
    'jest --findRelatedTests --passWithNoTests',
  ],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};

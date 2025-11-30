module.exports = {
  '*.{js,jsx,ts,tsx}': ['eslint --fix', 'jest --findRelatedTests'],
  '*.{json,md,yml,yaml}': ['prettier --write'],
};
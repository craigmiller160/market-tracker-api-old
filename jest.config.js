const jestConfig = require('@craigmiller160/jest-config');
const jestTsConfig = require('@craigmiller160/jest-config-ts');
const merge = require('@craigmiller160/config-merge');

module.exports = merge(jestConfig, jestTsConfig);

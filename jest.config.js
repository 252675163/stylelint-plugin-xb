const path = require("path")
module.exports = {
  "preset": "jest-preset-stylelint",
  "setupFiles": [path.resolve(__dirname, './jest.setup.js')]
}
module.exports = {
  singleQuote: false,
  semi: true,
  trailingComma: "es5",
  bracketSpacing: true,
  arrowParens: "always",
  bracketSameLine: true,
  jsxSingleQuote: false,
  overrides: [
    {
      files: ["*.ts", "*.tsx", "*.mts"],
      options: {
        parser: "typescript",
      },
    },
  ],
};

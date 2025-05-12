// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPretteir from 'eslint-config-prettier/flat';

export default tseslint.config(
    eslint.configs.recommended,
    tseslint.configs.recommendedTypeChecked,
    {
        languageOptions: {
            parserOptions: {
                projectService: true,
                tsconfigRootDir: import.meta.dirname
            }
        }
    },
    {
        ignores: ['**/*.js', '**/*.mjs', '**/*.config.ts']
    },
    eslintConfigPretteir
);

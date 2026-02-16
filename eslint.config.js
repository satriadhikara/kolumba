//  @ts-check

import { tanstackConfig } from '@tanstack/eslint-config'

export default [
  ...tanstackConfig,
  {
    name: 'kolumba/ignores',
    ignores: [
      '.output',
      '.git',
      'node_modules',
      'eslint.config.js',
      'prettier.config.js',
      'vite.config.ts',
    ],
  },
]

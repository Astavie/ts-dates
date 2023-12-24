// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    overrides: {
      typescript: {
        'ts/no-redeclare': ['off'],
        'ts/no-use-before-define': ['off'],
      },
    },
  },
)

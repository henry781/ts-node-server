import typescript from 'rollup-plugin-typescript2';
import pkg from './package.json';
import autoExternal from 'rollup-plugin-auto-external';

export default {
    input: 'src/api.ts',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
        },
        {
            file: pkg.module,
            format: 'es',
        },
    ],
    plugins: [
        typescript({
            typescript: require('typescript'),
            exclude: ["**/*.test.ts"]
        }),
        autoExternal()
    ]
}

import babel from 'rollup-plugin-babel'
import commonjs from 'rollup-plugin-commonjs'
import external from 'rollup-plugin-peer-deps-external'
import postcss from 'rollup-plugin-postcss'
import resolve from 'rollup-plugin-node-resolve'
import url from 'rollup-plugin-url'
import includePaths from 'rollup-plugin-includepaths'
import svgr from '@svgr/rollup'
import pkg from './package.json'

const includePathOptions = {
    include: {},
    paths: ['src/lib', 'src/other'],
    external: [],
    extensions: ['.js', '.json', '.html', '.ts', '.tsx', '.css']
}

export default {
    input: 'src/index.tsx',
    output: [
        {
            file: pkg.main,
            format: 'cjs',
            sourcemap: true
        },
        {
            file: pkg.module,
            format: 'es',
            sourcemap: true
        }
    ],
    plugins: [
        external(),
        postcss({
            modules: true
        }),
        url(),
        svgr(),
        babel({
            exclude: 'node_modules/**',
            plugins: ['external-helpers']
        }),
        resolve(),
        commonjs(),
        includePaths(includePathOptions)
    ]
}

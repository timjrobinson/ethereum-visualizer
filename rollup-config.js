import resolve from '@rollup/plugin-node-resolve'; // locate and bundle dependencies in node_modules (mandatory)

export default {
	input: 'public/app.js',
	output: [
		{
			format: 'umd',
			name: 'MYAPP',
			file: 'dist/public/app.js'
		}
	],
	plugins: [ resolve() ]
};
const webpack = require('webpack');
const path = require('path');

module.exports = {
	mode: 'development',
  entry: './src/scripts/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist')
	},
	module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
			},
			{
				test: /\.(png|svg|jpg|gif)$/,
				use: ['file-loader']
			}
    ],
  },
	devtool: 'inline-source-map',
	devServer: {
		contentBase: './dist',
		https: false,
		port: 8686
	},
	plugins: [
		new webpack.ProvidePlugin({
			$: 'jquery',
			jQuery: 'jquery',
			noUiSlider: 'nouislider'
		})
	]
};
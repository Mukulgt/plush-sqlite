const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const ImageMinimizerPlugin = require('image-minimizer-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

module.exports = {
  mode: isDevelopment ? 'development' : 'production',
  entry: {
    main: './src/js/main.js',
    products: './src/js/products.js',
    cart: './src/js/cart.js',
    blog: './src/js/blog.js',
    contact: './src/js/contact.js',
    faq: './src/js/faq.js',
    admin: './src/js/admin.js'
  },
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'js/[name].[contenthash].js',
    clean: true
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'dist'),
    },
    hot: true,
    open: true,
    port: 8080,
    historyApiFallback: true
  },
  optimization: {
    minimizer: [new TerserPlugin()],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      maxSize: 244000,
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
    runtimeChunk: 'single'
  },
  module: {
    rules: [
      {
        test: /\.(png|jpe?g|gif|webp)$/i,
        use: [
          {
            loader: 'image-webpack-loader',
            options: {
              mozjpeg: {
                progressive: true,
                quality: 65
              },
              optipng: {
                enabled: false,
              },
              pngquant: {
                quality: [0.65, 0.90],
                speed: 4
              },
              gifsicle: {
                interlaced: false,
              },
              webp: {
                quality: 75
              }
            }
          }
        ],
        type: 'asset',
        parser: {
          dataUrlCondition: {
            maxSize: 8192
          }
        }
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          isDevelopment ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          'postcss-loader'
        ]
      },
      {
        test: /\.(woff|woff2|eot|ttf|otf)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'fonts/[name].[hash][ext]'
        }
      }
    ]
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './src/index.html',
      filename: 'index.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './src/products.html',
      filename: 'products.html',
      chunks: ['products']
    }),
    new HtmlWebpackPlugin({
      template: './src/cart.html',
      filename: 'cart.html',
      chunks: ['cart']
    }),
    new HtmlWebpackPlugin({
      template: './src/about.html',
      filename: 'about.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './src/blog.html',
      filename: 'blog.html',
      chunks: ['blog']
    }),
    new HtmlWebpackPlugin({
      template: './src/contact.html',
      filename: 'contact.html',
      chunks: ['contact']
    }),
    new HtmlWebpackPlugin({
      template: './src/faq.html',
      filename: 'faq.html',
      chunks: ['faq']
    }),
    new HtmlWebpackPlugin({
      template: './src/size-guide.html',
      filename: 'size-guide.html',
      chunks: ['main']
    }),
    new HtmlWebpackPlugin({
      template: './src/admin.html',
      filename: 'admin.html',
      chunks: ['admin']
    }),
    new HtmlWebpackPlugin({
      template: './src/admin/login.html',
      filename: 'admin/login.html',
      chunks: ['admin']
    }),
    new HtmlWebpackPlugin({
      template: './src/admin/index.html',
      filename: 'admin/index.html',
      chunks: ['admin']
    }),
    new HtmlWebpackPlugin({
      template: './src/admin/orders.html',
      filename: 'admin/orders.html',
      chunks: ['admin']
    }),
    new HtmlWebpackPlugin({
      template: './src/admin/inventory.html',
      filename: 'admin/inventory.html',
      chunks: ['admin']
    }),
    new HtmlWebpackPlugin({
      template: './src/admin/products.html',
      filename: 'admin/products.html',
      chunks: ['admin']
    }),
    new MiniCssExtractPlugin({
      filename: isDevelopment ? 'css/[name].css' : 'css/[name].[contenthash].css'
    }),
    new ImageMinimizerPlugin({
      minimizer: {
        implementation: ImageMinimizerPlugin.imageminMinify,
        options: {
          plugins: [
            ['mozjpeg', { quality: 65, progressive: true }],
            ['pngquant', { quality: [0.65, 0.90], speed: 4 }],
            ['gifsicle', { interlaced: false }],
          ]
        }
      },
      generator: [{
        preset: 'webp',
        implementation: ImageMinimizerPlugin.imageminGenerate,
        options: {
          plugins: ['imagemin-webp']
        }
      }]
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/api', to: 'api' },
        { from: 'src/images', to: 'images', noErrorOnMissing: true }
      ]
    })
  ],
  devtool: isDevelopment ? 'source-map' : false
};
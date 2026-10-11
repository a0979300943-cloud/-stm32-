import path from 'path'

const config = {
  projectName: 'stm32-car-remote',
  date: '2026-8-14',
  designWidth: 750,
  deviceRatio: {
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  copy: {
    patterns: [],
    options: {}
  },
  framework: 'react',
  compiler: 'webpack5',
  cache: { enable: false },
  mini: {
    postcss: {
      pxtransform: { enable: true, config: {} },
      cssModules: {
        enable: true,
        config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' }
      }
    }
  },
  h5: {
    publicPath: '/',
    staticDirectory: 'static',
    esnextModules: ['taro-ui'],
    postcss: {
      autoprefixer: { enable: true, config: {} },
      cssModules: {
        enable: true,
        config: { namingPattern: 'module', generateScopedName: '[name]__[local]___[hash:base64:5]' }
      }
    }
  },
  alias: { '@': path.resolve(__dirname, '..', 'src') }
}

export default function (merge) {
  if (process.env.NODE_ENV === 'development') {
    return merge({}, config, require('./dev').default || require('./dev'))
  }
  return merge({}, config, require('./prod').default || require('./prod'))
}

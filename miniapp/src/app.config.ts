export default {
  pages: [
    'pages/remote/index',
    'pages/bluetooth/index',
    'pages/settings/index',
    'pages/command/index',
    'pages/logs/index'
  ],
  window: {
    backgroundTextStyle: 'dark',
    navigationBarBackgroundColor: '#0B1020',
    navigationBarTitleText: 'STM32 智能車遙控',
    navigationBarTextStyle: 'white',
    backgroundColor: '#0B1020'
  },
  tabBar: {
    color: '#64748B',
    selectedColor: '#00E0FF',
    backgroundColor: '#0B1020',
    borderStyle: 'black',
    list: [
      { pagePath: 'pages/remote/index',    text: '遙控' },
      { pagePath: 'pages/bluetooth/index', text: '藍牙' },
      { pagePath: 'pages/settings/index',  text: '設置' }
    ]
  }
}

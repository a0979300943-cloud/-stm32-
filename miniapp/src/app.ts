import { PropsWithChildren } from 'react'
import Taro, { useLaunch } from '@tarojs/taro'
import './app.scss'

function App({ children }: PropsWithChildren<any>) {
  useLaunch(() => {
    console.log('[App] 小程序啟動')
    // 請求位置權限（iOS 掃描 BLE 需要位置授權）
    if (process.env.TARO_ENV === 'weapp') {
      Taro.getSetting({
        success: (res) => {
          const auth = res.authSetting || {}
          if (auth['scope.userLocation'] === false) {
            Taro.showModal({
              title: '需要位置權限',
              content: 'iOS 掃描藍牙低功耗設備需開啟位置權限，請到設置中開啟。',
              showCancel: false
            })
          }
        }
      })
    }
  })
  return children
}

export default App

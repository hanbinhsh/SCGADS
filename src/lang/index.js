import { createI18n } from 'vue-i18n'
// 语言包
import zh from './zh'
import en from './en'

const i18n = createI18n({
  legacy: false, // 设置为 false，启用 composition API 模式
  locale: localStorage.getItem('localeLang') || 'zh',
  messages: {
    zh,
    en,
  },
})
export default i18n

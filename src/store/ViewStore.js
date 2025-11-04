import { defineStore } from 'pinia'
import { ref } from 'vue'

export const ViewStore = defineStore('ViewStore', () => {
  // 当前视图状态，默认显示计算器
  const currentView = ref('calculator')

  // 设置当前视图
  const setCurrentView = (view) => {
    currentView.value = view
    // 保存到 localStorage
    localStorage.setItem('currentView', view)
  }

  // 初始化视图，从 localStorage 读取
  const initView = () => {
    const savedView = localStorage.getItem('currentView')
    if (savedView && ['calculator', 'comparison'].includes(savedView)) {
      currentView.value = savedView
    } else {
      currentView.value = 'calculator'
    }
  }

  return {
    currentView,
    setCurrentView,
    initView
  }
})
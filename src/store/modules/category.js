import { ALL_CATEGORY_ITEM, CATEGORY_NOMAR_DATA } from '@/constants'
import { getCategory } from '@/api/category'

export default {
  //标记独立作用域
  namespaced: true,
  state: () => {
    return {
      categorys: CATEGORY_NOMAR_DATA
    }
  },
  mutations: {
    //为categorys赋值
    setCategorys(state, newCategorys) {
      state.categorys = [ALL_CATEGORY_ITEM, ...newCategorys]
    }
  },
  actions: {
    async useCategoryData(context) {
      const { categorys } = await getCategory()
      context.commit('setCategorys', categorys)
    }
  }
}

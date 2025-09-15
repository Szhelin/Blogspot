import { getPexelsList } from '@/api/pexels'

export default {
  namespaced: true,
  state: () => ({
    list: [],
    page: 1,
    size: 20,
    total: 0,
    isFinished: false,
    isLoading: false,
    query: { categoryId: '', searchText: '' }
  }),
  mutations: {
    setList(state, list) {
      state.list = list
    },
    appendList(state, list) {
      state.list.push(...list)
    },
    setPage(state, page) {
      state.page = page
    },
    setTotal(state, total) {
      state.total = total
    },
    setFinished(state, finished) {
      state.isFinished = finished
    },
    setLoading(state, loading) {
      state.isLoading = loading
    },
    setQuery(state, query) {
      state.query = { ...state.query, ...query }
    }
  },
  actions: {
    async fetchList({ state, commit }, reset = false) {
      if (state.isLoading || state.isFinished) return

      commit('setLoading', true)
      const page = reset ? 1 : state.page
      const res = await getPexelsList({
        ...state.query,
        page,
        size: state.size
      })

      if (reset) {
        commit('setList', res.list)
        commit('setPage', 1)
      } else {
        commit('appendList', res.list)
        commit('setPage', state.page + 1)
      }

      commit('setTotal', res.total)
      commit('setFinished', state.list.length >= res.total)
      commit('setLoading', false)
    },
    resetQuery({ commit, dispatch }, query) {
      commit('setQuery', query)
      commit('setFinished', false)
      dispatch('fetchList', true)
    }
  }
}

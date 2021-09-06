import { createStore } from 'vuex'
import router from '../router'

export default createStore({
  state: {
    tareas: [],
    tarea: {
      id: '',
      nombre: '',
      categorias: [],
      estado: '',
      numero: 0
    }
  },
  mutations: {
    cargar(state, payload) {
      state.tareas = payload
    },
    set(state, payload) {
      state.tareas.push(payload)
      // localStorage.setItem('tareas', JSON.stringify(state.tareas))
    },
    eliminar(state, payload) {
      state.tareas = state.tareas.filter(item => item.id !== payload)
      // localStorage.setItem('tareas', JSON.stringify(state.tareas))
    },
    tarea(state, payload) {
      if (!state.tareas.find(item => item.id === payload)) {
        router.push('/')
        return
      }
      state.tarea = state.tareas.find(item => item.id === payload)
    },
    update(state, payload) {
      state.tareas = state.tareas.map(item => item.id === payload.id ? payload : item)
      router.push('/')
      // localStorage.setItem('tareas', JSON.stringify(state.tareas))
    }
  },
  actions: {
    async cargarLocalStorage({ commit }) {
      try {
        const res = await fetch('https://back-firebase-default-rtdb.firebaseio.com/tareas.json')
        const dataDB = await res.json();
        // console.log(dataDB);
        const arrayTareas = []
        for (let id in dataDB) {
          // console.log(id)
          // console.log(dataDB[id]);
          arrayTareas.push(dataDB[id])
        }
        commit('cargar', arrayTareas)
        // console.log(arrayTareas)
      } catch (error) {
        console.log(error);
      }
      // if (localStorage.getItem('tareas')) {
      //   const tareas = JSON.parse(localStorage.getItem('tareas'))
      //   commit('cargar', tareas)
      //   return
      // }

      // localStorage.setItem('tareas', JSON.stringify([]))
    },
    async setTareas({ commit }, tarea) {

      try {
        const res = await fetch(`https://back-firebase-default-rtdb.firebaseio.com/tareas/${tarea.id}.json`, { 
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tarea)
        })
        const dataDB = await res.json();
        console.log(dataDB);
        commit('set', tarea)

      } catch (error) {
        console.error(error);
      }
    },
    async deleteTareas({ commit }, id) {

      try {
        await fetch(`https://back-firebase-default-rtdb.firebaseio.com/tareas/${id}.json`, { 
          method: 'DELETE',
        })
        commit('eliminar', id)
      } catch (error) {
        console.error(error);
      }
    },
    setTarea({ commit }, id) {
      commit('tarea', id)
    },
    async updateTarea({ commit }, tarea) {
      try {
        const res = await fetch(`https://back-firebase-default-rtdb.firebaseio.com/tareas/${tarea.id}.json`, { 
          method: 'PATCH', 
          headers: { 
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tarea)          
        })
        const dataDB = await res.json();
        // console.log(dataDB)
        commit('update', tarea)
      } catch (error) {
        console.error(error);
      }
      commit('update', tarea)
    }
  },
  modules: {
  }
})

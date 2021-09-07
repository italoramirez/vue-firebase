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
    },
    user: null
  },
  mutations: {

    setUser( state, payload) { 
      state.user = payload
    },

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

    async registrarUsuario ({commit}, usuario) {
      try {
        const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyCQW-33KVNVCuquuvn9T2MDnXJnCiibj4U', {
          method: 'POST',
          body: JSON.stringify({
            email: usuario.email, 
            password: usuario.password,
            returnSecureToken: true
          })
        })
        const userDB = await res.json();
        if ( userDB.errors ) { 
          console.log( userDB.errors )
          return
        }
        console.log(userDB);
        commit('setUser', userDB)
      } catch (error) {
        console.log(error);
      }
      console.log(usuario)
    },
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

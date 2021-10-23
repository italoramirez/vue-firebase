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
    user: null,
    error: {tipo: null, mensaje: null}
  },
  mutations: {
    setError(state, payload) {
      if (payload === null) {
        return state.error = {tipo: null, mensaje: null}
      }
      if ( payload=== 'EMAIL_NOT_FOUND') {
        return state.error = {tipo: 'email', mensaje: 'Email no registrado'}
      }
      if ( payload=== 'INVALID_PASSWORD') {
        return state.error = {tipo: 'password', mensaje: 'Contraseña incorrecta'}
      }
      if ( payload=== 'EMAIL_EXISTS') {
        return state.error = {tipo: 'email', mensaje: 'Email ya registrado'}
      }
      if ( payload=== 'INVALID_EMAIL') {
        return state.error = {tipo: 'email', mensaje: 'Ingrese un correo válido'}
      }
    },
    setUser(state, payload) {
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
    cerrarSesion ({ commit }) {
        commit('setUser', null)
      router.push('/login');
        localStorage.removeItem('user')
    },
    async login ( { commit }, usuario ) {
      try {
        const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=AIzaSyBHMV_25CCyXymOD-6k1FiGGiJgP8cvNWs', {
          method: 'POST',
          body: JSON.stringify({
            email         : usuario.email,
            password      : usuario.password,
            returnSecureToken: true
          })
        })
        const userDB = await res.json();
        // console.log('login ', userDB);
          console.log(userDB.error);
        if ( userDB.error ) {
          return commit('setError', userDB.error.message)
        }
        commit('setUser', userDB)
        commit('setError', null)
        router.push('/');
        localStorage.setItem('user', JSON.stringify(userDB))
      } catch (error) {
        console.log(error);
      }
    },
    async registrarUsuario ({commit}, usuario) {
      try {
        const res = await fetch('https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=AIzaSyBHMV_25CCyXymOD-6k1FiGGiJgP8cvNWs', {
          method: 'POST',
          body: JSON.stringify({
            email: usuario.email,
            password: usuario.password,
            returnSecureToken: true
          })
        })
        const userDB = await res.json();

        if ( userDB.error ) {
          return commit('setError', userDB.error.message)
        }
        console.log(userDB);
        commit('setUser', userDB)
        commit('setError', null)
        router.push('/');
        localStorage.setItem('user', JSON.stringify(userDB));
      } catch (error) {
        console.log(error);
      }
      console.log(usuario)
    },
    async cargarLocalStorage({ commit, state }) {
      if (localStorage.getItem('user')) {
        commit('setUser', JSON.parse(localStorage.getItem('user')))
      } else {
        return commit('setUser', null)
      }
      try {
        const res = await fetch(`https://back-firebase-default-rtdb.firebaseio.com/tareas/${state.user.localId}.json?auth=${state.user.idToken}`)
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
    async setTareas({ commit, state }, tarea) {

      try {
        const res = await fetch(`https://back-firebase-default-rtdb.firebaseio.com/tareas/${state.user.localId}/${tarea.id}.json?auth=${state.user.idToken}`, {
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
    async deleteTareas({ commit, state }, id) {

      try {
        await fetch(`https://back-firebase-default-rtdb.firebaseio.com/tareas/${state.user.localId}/${id}.json?auth=${state.user.idToken}`, {
          method: 'DELETE',
        })
        commit('eliminar', id)
      } catch (error) {
        console.error(error);
      }
    },
    setTarea({ commit, state }, id) {
      commit('tarea', id)
    },
    async updateTarea({ commit, state }, tarea) {
      try {
        const res = await fetch(`https://back-firebase-default-rtdb.firebaseio.com/tareas/${state.user.localId}/${tarea.id}.json?auth=${state.user.idToken}`, {
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
  getters: {
    usuarioAutenticado(state) {
      return !!state.user
    }
  },
  modules: {
  }
})

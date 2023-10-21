import { createStore } from 'vuex'

export default createStore({
    state: {
        peerid: null,
        connections: [],
        smart_token: "",
        user: undefined,
        folder: [],
        chat: [],
        avatar: []
    },
    getters: {
        PEERID: state => {
            return state.peerid
        },
        CHAT: state => {
            return state.chat
        },
        FOLDER: state => {
            return state.folder
        },
        AVATAR: state => {
            return state.avatar
        },
        CONNECTIONS: state => {
            return state.connections
        },
        SMARTTOKEN: state => {
            return state.smart_token
        },
        USER: state => {
            return state.user
        }
    },
    mutations: {
        SET_PEER_ID: (state, payload) => {
            state.peerid = payload
        },
        SET_CONNECTIONS: (state, payload) => {
            state.connections = payload
        },
        SET_SMART_TOKEN: (state, payload) => {
            state.smart_token = payload
        },
        SET_USER: (state, payload) => {
            state.user = payload
        },
        SET_CHAT: (state, payload) => {
            state.chat = payload
        },
        SET_FOLDER: (state, payload) => {
            state.folder = payload
        },
        SET_AVATAR: (state, payload) => {
            state.avatar = payload
        },
    },
    actions: {
        SET_PEER_ID: (context, payload) => {
            context.commit('SET_PEER_ID', payload);
        },
        SET_CONNECTIONS: (context, payload) => {
            context.commit('SET_CONNECTIONS', payload);
        },
        SET_SMART_TOKEN: (context, payload) => {
            context.commit('SET_SMART_TOKEN', payload);
        },
        SET_USER: (context, payload) => {
            context.commit('SET_USER', payload);
        },
        SET_CHAT: (context, payload) => {
            context.commit('SET_CHAT', payload);
        },
        SET_FOLDER: (context, payload) => {
            context.commit('SET_FOLDER', payload);
        },
        SET_AVATAR: (context, payload) => {
            context.commit('SET_AVATAR', payload);
        },
    },
    modules: {}
})

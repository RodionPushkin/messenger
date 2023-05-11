import { createStore } from 'vuex'

export default createStore({
    state: {
        peerid: null,
        connections: [],
        showCommunication: false,
        isCalling: false,
        connectTo: null,
    },
    getters: {
        PEERID: state => {
            return state.peerid
        },
        CONNECTIONS: state => {
            return state.connections
        },
        SHOWCOMMUNICATION: state => {
            return state.showCommunication
        },
        ISCALLING: state => {
            return state.isCalling
        },
        CONNECTTO: state => {
            return state.connectTo
        },
    },
    mutations: {
        SET_PEER_ID: (state, payload) => {
            state.peerid = payload
        },
        SET_CONNECTIONS: (state, payload) => {
            state.connections = payload
        },
        SET_SHOW_COMMUNICATION: (state, payload) => {
            state.showCommunication = payload
        },
        SET_IS_CALLING: (state, payload) => {
            state.isCalling = payload
        },
        SET_CONNECT_TO: (state, payload) => {
            state.connectTo = payload
        },
    },
    actions: {
        SET_PEER_ID: (context, payload) => {
            context.commit('SET_PEER_ID', payload);
        },
        SET_CONNECTIONS: (context, payload) => {
            context.commit('SET_CONNECTIONS', payload);
        },
        SET_SHOW_COMMUNICATION: (context, payload) => {
            context.commit('SET_SHOW_COMMUNICATION', payload);
        },
        SET_IS_CALLING: (context, payload) => {
            context.commit('SET_IS_CALLING', payload);
        },
        SET_CONNECT_TO: (context, payload) => {
            context.commit('SET_CONNECT_TO', payload);
        },
    },
    modules: {}
})

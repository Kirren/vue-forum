import Vue from 'vue'
import firebase from 'firebase'

import { makeAppendChildToParentMutation } from '../storeHelpers'
import { countObjectLength } from '../../helpers'

export default {
  namespaced: true,
  state: {
    all: {}
  },
  getters: {
    threadRepliesCount: state => id => countObjectLength(state.all[id].posts) - 1,
    threadContributorsCount: state => id => countObjectLength(state.all[id].contributors) - 1
  },
  actions: {
    createThread ({commit, state, dispatch, rootState}, {title, text, forumId}) {
      return new Promise((resolve, reject) => {
        const threadId = firebase.database().ref('threads').push().key
        const postId = firebase.database().ref('posts').push().key
        const userId = rootState.auth.authId
        const publishedAt = Math.floor(Date.now() / 1000)

        const thread = { title, forumId, publishedAt, userId, firstPostId: postId, posts: {} }
        thread.posts[postId] = postId
        const post = { text, publishedAt, threadId, userId }

        const updates = {}

        updates[`threads/${threadId}`] = thread
        updates[`forums/${forumId}/threads/${threadId}`] = threadId
        updates[`users/${userId}/threads/${threadId}`] = threadId

        updates[`posts/${postId}`] = post
        updates[`users/${userId}/posts/${postId}`] = postId

        firebase.database().ref().update(updates)
          .then(() => {
            commit('setData', {resource: 'threads', item: thread, id: threadId}, {root: true})
            commit('forums/appendThreadToForum', {parentId: forumId, childId: threadId}, {root: true})
            commit('users/appendThreadToUser', {parentId: userId, childId: threadId}, {root: true})

            commit('setData', {resource: 'posts', item: post, id: postId}, {root: true})
            commit('appendPostToThread', {parentId: post.threadId, childId: postId})
            commit('users/appendPostToUser', {parentId: post.userId, childId: postId}, {root: true})

            resolve(state.all[threadId])
          })
      })
    },
    updateThread ({commit, state, dispatch, rootState}, {title, text, id}) {
      return new Promise((resolve, reject) => {
        const thread = state.all[id]
        const post = rootState.posts.all[thread.firstPostId]

        const edit = {
          at: Math.floor(Date.now() / 1000),
          by: rootState.auth.authId
        }

        const updates = {}

        updates[`posts/${thread.firstPostId}/text`] = text
        updates[`posts/${thread.firstPostId}/edited`] = edit
        updates[`threads/${id}/title`] = title

        firebase.database().ref().update(updates)
          .then(() => {
            commit('setThread', {thread: {...thread, title}, threadId: id})
            commit('posts/setPost', { postId: thread.firstPostId, post: { ...post, text, edited: edit } }, {root: true})

            resolve(post)
          })
      })
    },
    fetchThread: ({dispatch}, {id}) => dispatch('fetchData', {id, resource: 'threads'}, {root: true}),
    fetchThreads: ({dispatch}, {ids}) => dispatch('fetchDataArray', {ids, resource: 'threads'}, {root: true})
  },
  mutations: {
    setThread (state, {thread, threadId}) {
      Vue.set(state.all, threadId, thread)
    },
    appendContributorToThread: makeAppendChildToParentMutation({parent: 'threads', child: 'contributors'}),
    appendPostToThread: makeAppendChildToParentMutation({parent: 'threads', child: 'posts'})
  }
}

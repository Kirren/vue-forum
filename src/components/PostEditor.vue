<template>
  <b-col>
    <form @submit.prevent="save">
      <div class="form-group">
        <textarea name="postMessage"
                  id="" class="form-control"
                  cols="30" rows="3"
                  v-model="text">
        </textarea>
      </div>
      <b-button-group>
        <b-button v-if="isUpdate"
                  variant="light"
                  @click="cancel">
          Cancel
        </b-button>
        <b-button variant="success"
                  type="submit">
          {{isUpdate ? 'Update' : 'Submit'}}
        </b-button>
      </b-button-group>
    </form>
  </b-col>
</template>

<script>
  import { mapActions } from 'vuex'

  export default {
    props: {
      threadId: {
        required: false,
        type: String
      },
      post: {
        type: Object,
        validator: obj => {
          const keyIsValid = typeof obj['.key'] === 'string'
          const textIsValid = typeof obj.text === 'string'

          return keyIsValid && textIsValid
        }
      }
    },
    data () {
      return {
        text: this.post ? this.post.text : ''
      }
    },
    computed: {
      isUpdate () {
        return !!this.post
      }
    },
    methods: {
      ...mapActions('posts', ['createPost', 'updatePost']),
      save () {
        this.persist()
          .then(post => {
            this.$emit('save', {post})
          })
      },
      create () {
        const post = {
          text: this.text,
          threadId: this.threadId
        }
        this.text = ''

        this.$emit('save', {post})
        return this.createPost(post)
      },
      update () {
        const payload = {
          id: this.post['.key'],
          text: this.text
        }
        return this.updatePost(payload)
      },
      persist () {
        return this.isUpdate ? this.update() : this.create()
      },
      cancel () {
        this.$emit('cancel')
      }
    }
  }
</script>

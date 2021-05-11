<template lang="pug">
  section
    .container
      img(src="/images/logo.png" :alt="message")
      p {{ message }}
</template>


<script>
export default {
  name: 'Example',

  data () {
    return {
      message: 'Example Vue component',
    }
  }

};
</script>

<style>

</style>
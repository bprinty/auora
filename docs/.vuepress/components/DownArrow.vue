<template>
  <div class="down-icon" v-on:click="scrollDown">
    <i class="glimmer fas fa-angle-double-down" aria-hidden="true"></i>
  </div>
</template>

<script>
export default {
  name: 'down-arrow',
  methods: {
    scrollDown() {
      console.log('in!');
      // TODO: don't hardcode the pixel count here - detect the
      //       next element after this one and scroll to it.
      window.scrollTo({ top: 750, behavior: 'smooth' });
    }
  }
};
</script>

<style>
  .down-icon {
    margin-left: auto;
    margin-right: auto;
    text-align: center;
    display: block;
  }
  .down-icon:hover {
    cursor: pointer;
  }
  .glimmer {
    animation-name: glimmer;
    animation-duration: 3s;
    animation-iteration-count: infinite;
    animation-timing-function: linear;
  }
  @keyframes glimmer {
    0% { opacity: 0.75; }
    50% { opacity: 0.25; }
    100% { opacity: 0.75; }
  }
</style>

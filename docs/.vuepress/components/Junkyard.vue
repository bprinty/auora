<template>
  <div class="junkyard custom-block danger">
    <p class="custom-block-title">JUNKYARD</p>
    <p>Below contains pieces from old documentation or incomplete thoughts. Please <strong>remove this section when publishing</strong> this documentation.</p>
    <hr />
    <hr />
    <p>...</p>
    <slot></slot>
  </div>
</template>

<script>
export default {
  name: 'junkyard',
};
</script>

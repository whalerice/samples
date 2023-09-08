<template>
  <fragment>
    <Team />
    <Today />
  </fragment>
</template>

<script>
// @ is an alias to /src
// import HelloWorld from "@/components/HelloWorld.vue";
import Team from "@/components/Team.vue";
import Today from "@/components/Today.vue";

export default {
  name: "Home",
  components: {
    Team,
    Today,
  },
};
</script>

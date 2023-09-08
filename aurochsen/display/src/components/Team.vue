<template>
  <article class="row team-area">
    <h2 class="title">Team ranking</h2>
    <section class="contents">
      {{$store.state.today}}
      <div class="box first-ranking">
        <div class="num">{{ rankingFirst.id }}<span>st</span></div>
        <dl>
          <dt>팀명</dt>
          <dd>{{ rankingFirst.teamName }}</dd>
          <dt>평가자산/운용자산</dt>
          <dd>
            {{ rankingFirst.valued | delimiter | currency }} /
            {{ rankingFirst.operating | delimiter | currency }}
          </dd>
          <dt>총 수익률</dt>
          <dd>
            <span :class="rankingFirst.rateType ? 'rate-up' : 'rate-down'">
              <fragment v-if="rankingFirst.rateType">+</fragment
              ><fragment v-else>-</fragment>
              {{ rankingFirst.totalRate | percent }}</span
            >
          </dd>
        </dl>
      </div>
      <div class="box">
        <table class="table team-table">
          <colgroup>
            <col width="5%" />
            <col width="*" />
            <col width="25%" span="2" />
            <col width="15%" />
          </colgroup>
          <thead>
            <tr>
              <th></th>
              <th>팀명</th>
              <th>평가자산</th>
              <th>운용자산</th>
              <th>총 수익률</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in ranking" :key="item.id">
              <td>{{ item.id }}</td>
              <td>{{ item.teamName }}</td>
              <td>{{ item.valued | delimiter }}</td>
              <td>{{ item.operating | delimiter }}</td>
              <td>
                <span :class="item.rateType ? 'rate-up' : 'rate-down'">
                  <fragment v-if="item.rateType">+</fragment>
                  <fragment v-else>-</fragment>
                  {{ item.totalRate | percent }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </article>
</template>

<script>
export default {
  name: "Team",
  data() {
    return {
      state: this.$store.state.team,
      rankingFirst: this.$store.state.team[0],
      ranking: [],
    };
  },
  created() {
    this.$store.dispatch('getToday');
  },
  mounted() {
    this.ranking = this.$store.state.team.filter((item) => {
      if (item.id > 1) {
        return item;
      }
    });
  },
  methods: {

  },
};
</script>
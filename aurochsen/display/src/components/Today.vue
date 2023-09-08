<template>
  <article class="row today-area">
    <h2 class="title">Today's ranking</h2>
    <section class="contents">
      <div class="ranking-box">
        <ul class="ranking-list">
          <li v-for="item in ranking" :key="item.id">
            <i :class="`medal medal-${item.id}`"></i>
            <dl>
              <dt>이름</dt>
              <dd>{{ item.name }}</dd>
              <dt>팀명</dt>
              <dd>{{ item.teamName | delimiter }}</dd>
              <dt>평가자산</dt>
              <dd>{{ item.valued | delimiter }}</dd>
              <dt>운용자산</dt>
              <dd>{{ item.operating | delimiter }}</dd>
              <dt>총 수익률</dt>
              <dd>
                <fragment v-if="item.totalRateType">+</fragment
                ><fragment v-else>-</fragment>
                {{ item.totalRate | percent }}
              </dd>
            </dl>
          </li>
        </ul>
      </div>
      <table class="table today-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>이름(팀)</th>
            <th>평가자산</th>
            <th>운용자산</th>
            <th>총 수익률</th>
            <th>오늘 수익률</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              {{ item.name }}<small>({{ item.teamName }})</small>
            </td>
            <td>
              <span class="co-ye">{{ item.valued | delimiter }}</span>
            </td>
            <td>
              <span class="co-ye">{{ item.operating | delimiter }}</span>
            </td>
            <td>
              <span :class="item.totalRateType ? 'rate-up' : 'rate-down'">
                <fragment v-if="item.totalRateType">+</fragment>
                <fragment v-else>-</fragment>
                {{ item.totalRate | percent }}</span
              >
            </td>
            <td>
              <span :class="item.todayRateType ? 'rate-up' : 'rate-down'">
                <fragment v-if="item.todayRateType">+</fragment>
                <fragment v-else>-</fragment>
                {{ item.totalRate | percent }}</span
              >
            </td>
          </tr>
        </tbody>
      </table>
      <table class="table today-table">
        <thead>
          <tr>
            <th>순위</th>
            <th>이름(팀)</th>
            <th>평가자산</th>
            <th>운용자산</th>
            <th>총 수익률</th>
            <th>오늘 수익률</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in list2" :key="item.id">
            <td>{{ item.id }}</td>
            <td>
              {{ item.name }}<small>({{ item.teamName }})</small>
            </td>
            <td>
              <span class="co-ye">{{ item.valued | delimiter }}</span>
            </td>
            <td>
              <span class="co-ye">{{ item.operating | delimiter }}</span>
            </td>
            <td>
              <span :class="item.totalRateType ? 'rate-up' : 'rate-down'">
                <fragment v-if="item.totalRateType">+</fragment>
                <fragment v-else>-</fragment>
                {{ item.totalRate | percent }}</span
              >
            </td>
            <td>
              <span :class="item.todayRateType ? 'rate-up' : 'rate-down'">
                <fragment v-if="item.todayRateType">+</fragment>
                <fragment v-else>-</fragment>
                {{ item.totalRate | percent }}</span
              >
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </article>
</template>

<script>
export default {
  name: "Today",
  data() {
    return {
      state: [],
      ranking: [],
      list: [],
      list2: [],
    };
  },
  mounted() {
    for (let i = 0; i < 31; i++) {
      const item = {
        id: i + 1,
        name: "오록센" + Number(i + 1),
        teamName: "Trade Master team",
        valued: 123589999,
        operating: 100000000,
        totalRate: 2.3589,
        totalRateType: true,
        todayRate: 2.3,
        todayRateType: false,
      };
      this.state.push(item);
    }

    this.ranking = this.list = this.state.filter((item) => {
      if (item.id > 0 && item.id < 4) {
        return item;
      }
    });

    this.list = this.state.filter((item) => {
      if (item.id > 3 && item.id < 18) {
        return item;
      }
    });

    this.list2 = this.state.filter((item) => {
      if (item.id > 17) {
        return item;
      }
    });
  },
};
</script>

<style>
</style>
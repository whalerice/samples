import Vue from "vue";

Vue.filter('delimiter', function(value){
	return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
})

Vue.filter('currency', function (value) {
    return `${value} KRW`;
});


Vue.filter('percent', function (value) {
    return `${(value * 100).toFixed(2)} %`;
});
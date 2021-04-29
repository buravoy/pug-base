import Vue from 'vue';
import Example from '../../components/Example';

new Vue({
    components: {
        Example
    },

    el: '#app',

    mounted() {
        console.log('Vue is here');
    }
});

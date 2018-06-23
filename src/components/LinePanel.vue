<template>
  <div class='layercardbox'>
    <Card>
        <p slot="title">{{param.name}}</p>
        <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
            {{ visible }}
        </span>
        <!-- 控制线宽 -->
        <Row>
          <div style="margin-top:10px;">
            <div style="float:left">
              <span>线宽</span>
            </div>
            <div style="float:right">
              <i-switch size="large" v-model="manual_width">
                 <span slot="open">手动</span>
                 <span slot="close">自动</span>
               </i-switch>
            </div>
          </div>
        </Row>
        <Row>
          <Slider v-model="param.width" :max='widthMax' :min='widthMin' :step='0.5' show-tip='never' :disabled="!manual_width"></Slider>
        </Row>
        <!--自定义样式的样式间隔-->
        <Row>
          <div style="margin-top:10px;">
            <div style="float:left">
              <span>样式间隔</span>
            </div>
            <div style="float:right">
              <i-switch size="large" v-model="manual_interval">
                 <span slot="open">手动</span>
                 <span slot="close">自动</span>
               </i-switch>
            </div>
          </div>
        </Row>
        <Row>
          <Slider v-model="param.interval" :max='intervalMax' :min='intervalMin' :step='0.0001' show-tip='never' :disabled="!manual_interval"></Slider>
        </Row>
        <Row>
          <!-- <ButtonGroup shape="circle"> -->
              <Button type="ghost" size="small" @click="toColorPage"><Icon type="chevron-left"></Icon> 颜色</Button>
              <Button type="ghost" size="small" @click.prevent="toStylePage">样式 <Icon type="chevron-right"></Icon></Button>
          <!-- </ButtonGroup> -->
        </Row>
    </Card>
  </div>
</template>

<script>

  const INTERVAL = {
    '7': 0.02,
    '8': 0.0175,
    '9': 0.015,
    '10': 0.0125,
    '11': 0.01,
    '12': 0.0075,
    '13': 0.005,
    '14': 0.0025,
    '15': 0.00125,
    '16': 0.001,
    '17': 0.0005,
    '18': 0.0003,
    '19': 0.0002,
    '20': 0.0001,
    '21': 0.0001,
    '22': 0.0001,
  }; // 每个地图分级都对应一个样式间距；

  export default {
    name: 'LinePanel',
    props: ['param','topMenu'],
    mounted() {
      var scope = this;
      // 确保ol地图对象已经保存
      setTimeout( function() {

        /**
         * 监听地图分辨率变化的处理函数
         * @return {[type]} [description]
         */
        function checkZoom () {
          // 如果是手动控制的话直接返回
          let zoom = scope.zoom = map.getView().getZoom();
          if( !scope.manual_width ) {
            // 计算新的符号缩放大小
            scope.param.width = ( scope.widthMax - scope.widthMin ) * ( ( zoom - minZoom ) / ( maxZoom - minZoom ) )
          }
          // 如果样式间隔是自动控制的话
          if( !scope.manual_interval ) {
            scope.param.interval = INTERVAL[parseInt( zoom )];
            // console.log( parseInt( zoom ), INTERVAL[parseInt( zoom )] );
          } else {
            // 如果样式间隔是手动控制，每次缩放都要重新赋值间隔的区间
            // 最优间距
            // const best = INTERVAL[parseInt( zoom )];
            // scope.intervalMax = best * 4;
          }

        }

        var map = scope.__global__.olMap;
        map.getView().on('change:resolution',checkZoom);
        var maxZoom = map.getView().getMaxZoom();
        var minZoom = map.getView().getMinZoom();
      }, 0 )
    },
    methods: {
      /**
       * 更改图层可见性
       * @return {[type]} [description]
       */
      changeVisibility() {
        this.param.visible = !this.param.visible;
      },
      /**
       * 跳转到颜色选择页
       * @return {[type]} [description]
       */
      toColorPage() {
        this.topMenu.toPage( 'color', this.param );
      },
      /**
       * 跳转到样式选择页
       * @return {[type]} [description]
       */
      toStylePage() {
        this.topMenu.toPage( 'style', this.param );
      }
    },
    data () {
      return {
        manual_width: false, // 线宽是否手动
        manual_interval: false, // 样式间隔是否手动
        widthMax: 10,
        widthMin: 0,
        intervalMax: 0.02,
        intervalMin: 0.0,
        zoom: 7,
      }
    },
    computed: {
      /**
       * 图层可见性
       * @return {[type]} [description]
       */
      visible: function() {
        return this.param.visible? '隐藏' : '显示';
      },
      // /**
      //  * 样式间隔的最大值
      //  * @return {[type]} [description]
      //  */
      // intervalMax: function() {
      //
      //   // 如果是手动控制，地图的每一级都要重新绑定间隔的最大值
      //   if( this.manual_interval ) {
      //     console.log(this.zoom);
      //     return INTERVAL[parseInt( this.zoom )] * 4;
      //   } else { // 如果是自动控制
      //     return 0.02;
      //   }
      // },
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>


</style>

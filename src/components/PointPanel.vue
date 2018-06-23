<template>
  <transition name="scale" mode="out-in">
    <!-- 点状符号分级设色面板 -->
    <div class='layercardbox' v-if="param.isGrade" key="grade">
      <Card>
          <p slot="title">{{param.name}}-分级</p>
          <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
              {{ visible }}
          </span>
          <Row>
            <Select v-model="param.gradeField">
                <Option v-if="param.fields.length" v-for="item in param.fields" :value="item.field" :key="item.field">{{ item.field }}</Option>
            </Select>
          </Row>
          <Row>
            <Select v-model="param.gradeMethod">
                <Option v-for="item in gradeMethods" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </Row>
          <Row>
            <div style="margin-top:10px;">
              <div style="float:left">
                <span>大小</span>
              </div>
              <div style="float:right">
                <i-switch size="large" v-model="manual">
                   <span slot="open">手动</span>
                   <span slot="close">自动</span>
                 </i-switch>
              </div>
            </div>
          </Row>
          <Row>
            <Slider v-model="param.scale" :max='scaleMax' :min='scaleMin' :step='0.01' show-tip='never' :disabled="!manual"></Slider>
          </Row>
          <Row>
            分级数
            <Slider v-model="param.gradeCount" show-input :max='10' :min='3' :step='1' show-tip='never'></Slider>
          </Row>
          <Row>
            <!-- <ButtonGroup shape="circle"> -->
                <Button type="ghost" size="small" @click="toColorPage"><Icon type="chevron-left"></Icon> 颜色</Button>
                <Button type="ghost" size="small" @click="changeToGrade">普通符号</Button>
                <Button type="ghost" size="small" @click.prevent="toStylePage">样式 <Icon type="chevron-right"></Icon></Button>
            <!-- </ButtonGroup> -->
          </Row>
      </Card>
    </div>
    <!-- 点状符号聚类面板 -->
    <div class='layercardbox' v-else-if="param.isCluster" key="cluster">
      <Card>
          <p slot="title">{{param.name}}-聚类</p>
          <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
              {{ visible }}
          </span>
          <!-- <Row>
            <Select v-model="param.gradeMethod">
                <Option v-for="item in gradeMethods" :value="item" :key="item">{{ item }}</Option>
            </Select>
          </Row> -->
          <Row>
            集群间最小距离
            <Slider v-model="param.distance" show-input :max='distanceMax' :min='distanceMin' :step='1' show-tip='never'></Slider>
          </Row>
          <Row>
            <!-- <ButtonGroup shape="circle"> -->
                <Button type="ghost" size="small" @click="toColorPage"><Icon type="chevron-left"></Icon> 颜色</Button>
                <Button type="ghost" size="small" @click.prevent="changeToCluster">普通符号</Icon></Button>
            <!-- </ButtonGroup> -->
          </Row>
      </Card>
    </div>
    <!-- 普通点状图层面板 -->
    <div class='layercardbox' v-else key="point">
      <Card>
          <p slot="title">{{param.name}}</p>
          <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeLabels" >
              {{ labelVisible }}
          </span>
          <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
              {{ visible }}
          </span>
          <Row>
            <div style="margin-top:10px;">
              <div style="float:left">
                <span>大小</span>
              </div>
              <div style="float:right">
                <i-switch size="large" v-model="manual">
                   <span slot="open">手动</span>
                   <span slot="close">自动</span>
                 </i-switch>
              </div>
            </div>
          </Row>
          <Row>
            <Slider v-model="param.scale" :max='scaleMax' :min='scaleMin' :step='0.01' show-tip='never' :disabled="!manual"></Slider>
          </Row>
          <Row>
            透明度
             <Slider v-model="param.opacity" :max='1.1' :min='0' :step='0.05' show-tip='never'></Slider>
          </Row>
          <Row>
              <!-- <ButtonGroup shape="circle"> -->
            <Button type="ghost" size="small" @click.prevent="toColorPage"><Icon type="chevron-left"></Icon> 颜色</Button>
            <Button type="ghost" size="small" @click="changeToGrade">分级</Button>
            <Button type="ghost" size="small" @click="changeToCluster">聚类</Button>
            <Button type="ghost" size="small" @click.prevent="toStylePage">样式 <Icon type="chevron-right"></Icon></Button>
              <!-- </ButtonGroup> -->
          </Row>
      </Card>
    </div>
  </transition>
</template>

<script>

  export default {
    name: 'PointPanel',
    props: ['param', 'topMenu'],
    data () {
      return {
        manual: false,
        scaleMax: 2,
        scaleMin: 0,
        distanceMax: 100, // 集群间距最大值
        distanceMin: 0, // 集群间距最小值
        gradeMethods: ['等间距分段', '等比分段'],
      }
    },
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
          if( scope.manual ) return
          var zoom = map.getView().getZoom();
          // 计算新的符号缩放大小
          scope.param.scale = ( scope.scaleMax - scope.scaleMin ) * ( ( zoom - minZoom ) / ( maxZoom - minZoom ) )
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
       * 更改注记可见性
       * @return {[type]} [description]
       */
      changeLabels() {
        this.param.showLabels = !this.param.showLabels;
      },
      /**
       * 跳转到颜色选择页
       * @param { number } 要修改的颜色值的索引（应用于统计图表）
       * @return {[type]} [description]
       */
      toColorPage( index ) {
        var scope = this;
        this.topMenu.toPage( 'color', this.param, {
          isColorBar: this.param.isGrade,
          update: function( newColor ) {

            // 如果是统计图表，修改字段颜色的话
            if( scope.param.isChart ) {
              // 直接使用数组【索引】=新值 的方式不会触发视图的重新渲染
              scope.param.colors.splice(index, 1, newColor);
            }

            // 如果是聚类，为聚类符号修改背景颜色的话
            else if( scope.param.isCluster ) {
              scope.param.clusterColor = newColor;
            }

            // 普通点状符号的话
            else {
              scope.param.color = newColor;
            }

          }
        } );
      },
      /**
       * 跳转到样式选择页
       * @return {[type]} [description]
       */
      toStylePage() {
        var scope = this;
        this.topMenu.toPage( 'style', this.param ,{
          // 如果是图表图的话，执行update函数
          isChart: scope.param.isChart,
          update: function( newID ) {
            scope.param.isChart && ( scope.param.chartID = newID )
          }
        });
      },
      /**
       * 切换到分级符号面板
       * @return {[type]} [description]
       */
      changeToGrade () {
        this.param.isGrade = !this.param.isGrade;
      },
      /**
       * 切换至聚类统计面板
       * @return {[type]} [description]
       */
      changeToCluster() {
        this.param.isCluster = !this.param.isCluster;
      },

      /**
       * 关闭字段标签的时候的事件处理函数
       * @param  {[type]} event [description]
       * @param  {[type]} name  [字段名称]
       * @return {[type]}       [description]
       */
      handleClose2 (event, name) {
        const index = this.statFields.indexOf(name);
        this.statFields.splice(index, 1);
      }

    },
    computed: {
      visible: function() {
        return this.param.visible? '隐藏图层' : '显示图层';
      },
      labelVisible: function() {
        return this.param.showLabels? '隐藏注记' : '显示注记';
      },
      // statFields: function() {
      //   return this.param.fields.map( function( value ) { return value.field } );
      // }
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .colorpick{
    height: 5em;
    width: 5em;
  }

</style>

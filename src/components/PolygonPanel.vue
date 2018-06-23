<template>
    <transition name="scale" mode="out-in">
      <div v-bind:class="{ layercardbox: true }" v-if="!param.isGrade" key="polygon">
        <Card>
            <p slot="title">{{param.name}}</p>
            <span :style="{ cursor: 'pointer', color: 'blue' }" slot="extra" @click.prevent="changeVisibility" >
                {{ visible }}
            </span>
            <Row>
                <!-- <ButtonGroup shape="circle"> -->
                    <Button type="ghost" size="small" @click.prevent="toColorPage"><Icon type="chevron-left"></Icon> 颜色</Button>
                    <Button type="ghost" size="small" @click="changeToGrade">分级设色</Button>
                    <Button type="ghost" size="small" @click.prevent="toStylePage">样式 <Icon type="chevron-right"></Icon></Button>
                <!-- </ButtonGroup> -->
            </Row>
        </Card>
      </div>
      <div v-bind:class="{ layercardbox: true }" v-else key="grade">
        <Card>
            <p slot="title">{{param.name}}-分级设色</p>
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
              分级数
              <Slider v-model="param.gradeCount" show-input :max='10' :min='3' :step='1' show-tip='never'></Slider>
            </Row>
            <Row>
              <Button type="ghost" size="small" @click="changeToGrade">普通纹理</Button>
              <Button type="ghost" size="small" @click.prevent="toColorPage">选择色系</Button>
            </Row>
        </Card>
      </div>
    </transition>
</template>

<script>

  export default {
    name: 'PolygonPanel',
    props: ['param', 'topMenu'],
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
      /**
       * [跳转到颜色选择页]
       * @return {[type]}             [description]
       */
      toColorPage() {
          this.topMenu.toPage( 'color', this.param, { isColorBar: this.param.isGrade } );
      },
      /**
       * 跳转到样式选择页
       * @return {[type]} [description]
       */
      toStylePage() {
        this.topMenu.toPage( 'style', this.param );
      },

      changeToGrade () {
        this.param.isGrade = !this.param.isGrade;
      },
      handleClose2 (event, name) {
        const index = this.count.indexOf(name);
        this.count.splice(index, 1);
      }
    },
    data () {
      return {
        gradeMethods: ['等间距分段', '等比分段']
      }
    },
    computed: {
      visible: function() {
        return this.param.visible? '隐藏' : '显示';
      }
    }

  }
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
  /* .colorpick{
    height: 5em;
    width: 5em;
  } */
  .ivu-select-dropdown {
    position: absolute !important;
  }

  .ivu-select {
    margin-bottom: 10px;
  }

</style>

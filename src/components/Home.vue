<template>
  <div class="cont">
    <Tabs>
      <Tab-pane label="新建专题图"  style="font-size:60px;">
        <div class="cont-info">
          <b class="info1">选择地图模板开始制图！</b>
          <p class="info2">在线制图系统能够基于制图模板实现快速制图，提供三种默认专题图模板：自然类、工程类、管理类，分别包含不同的制图数据和制图参数，以实现三种主题的地图表达。</p>
        </div>
        <div class="cont2-template">
          <router-link :to="{ path: 'data', query: { type: '1' }}" >
            <mapTemplate
              class="maptemplate"
              pic="/static/pic/zrsx.png"
              name="自然类"
              discription="自然类模板表达自然水系的分布情况，包括河流、湖泊数据。"
              right="公开"
              temtype="default"
              />
          </router-link>
            <router-link :to="{ path: 'data', query: { type: '2' }}" >
          <mapTemplate
            class="maptemplate"
            pic="/static/pic/zrsx.png"
            name="工程类"
            discription="自然类模板表达自然水系的分布情况，包括河流、湖泊数据。"
            right="公开"
            temtype="default"
            />
          </router-link>
          <router-link :to="{ path: 'data', query: { type: '3' }}" >
          <mapTemplate
            class="maptemplate"
            pic="/static/pic/zrsx.png"
            name="管理类"
            discription="自然类模板表达自然水系的分布情况，包括河流、湖泊数据。"
            right="公开"
            temtype="default"
            />
          </router-link>
        </div>
      </Tab-pane>

      <Tab-pane label="我的模板">
          <mymap/>
      </Tab-pane>
      <Tab-pane label="地图广场">
        <mapsquare/>
      </Tab-pane>
    </Tabs>
  </div>
</template>
<script>
import mapTemplate from './MapTemplate';
// import search from './Search';
// import sort from './Sort';
import mymap from './MyMap';
import mapsquare from './MapSquare';

export default {
  components: {mapTemplate,mymap,mapsquare},
  name: 'Home',
  data () {
    return {
    }
  },
  created () {
    this.__global__.mappingData = [];
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

  .cont {
    display: flex;
    flex: 1;
    background-color: #fff;
    flex-direction: column;
    overflow: auto;
  }
  .cont2-template {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    margin-top: 10px;
     flex-wrap:  wrap;

  }

  .maptemplate {
    width: 400px;
    margin: 50px;

  }
  .cont-info {
    font-size: 18px;
    background-color: #f2f2f2;
    height: 15%;
    display: flex;
    flex-direction: column;
    align-items:flex-start;
    justify-content: center;
    /* padding-left: 9px; */
    padding: 10px;
  }
  .info1 {
    font-size: 22px;
    margin-bottom: 10px;
  }
  .ivu-tabs {
    overflow-y:  auto !important;
  }
  /* .ivu-tabs-nav-container {
    font-size: 18px !important;
  }
  .ivu-dropdown-item {
    font-size:35px !important;

  }
  .ivu-tabs-bar {
    margin-bottom: 6px !important;
  } */

</style>

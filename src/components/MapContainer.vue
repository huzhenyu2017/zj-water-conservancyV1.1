<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>

/**
 * ol和proj4都以静态文件的方式引进来的，方便调试
 *
 */

export default {
  name: 'mapContainer',
  data() {
    return {
      _olMap: null
    };
  },
  // props,
  // methods,
  mounted () {

    // 地图根节点的样式
    this.$el.style.overflow = "hidden";
    this.$el.style.height = '100%';
    this.$el.style.width = '100%';

    // OpenLayers不支持4490坐标系，需要自定义坐标系
    proj4.defs( "EPSG:4490", "+proj=longlat +ellps=GRS80 +no_defs" );
    var projection4490 = new ol.proj.get('EPSG:4490');
    projection4490.setExtent([-180,-90,180,90]);


     var layers = [

       // baseLayer,

     ];

    this._olMap = new ol.Map({
      target: this.$el,
      layers: layers,
      view: new ol.View({
        center: [120, 29.4],
        projection: 'EPSG:4490',
        extent: [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634],
        zoom: 8,
        minZoom: 7,
        maxZoom: 20
      }),
    });

    // 地图对象保存至全局
    if( !this.__global__.olMap ) {
      this.__global__.olMap = this._olMap
    } else { // 打印的情况，将地图对象绑定到父组件print
      this.$emit( 'bindMap', this._olMap );
    }

    // 添加瓦片
    this.$on("addtile", l => this._olMap.addLayer( l ));
    // 移除瓦片
    this.$on("removetile", l => this._olMap.removeLayer( l ));


    Object.defineProperties(this, /** @lends module:map/map# */{
      /**
       * OpenLayers的Map实例
       * @type {ol.Map|undefined}
       */
      $map: {
        enumerable: true,
        get: () => this.$olObject,
      },
      /**
       * OpenLayers view instance.
       * @type {ol.View|undefined}
       */
      $view: {
        enumerable: true,
        get: () => this._view,
      },
    })
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
  .vue2ol {
    height: 100%;
    width: 100%;
  }
</style>

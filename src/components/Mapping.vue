<template>
  <layout :style="{height: '100%', width: '100%'}">
    <layout v-show="showType === 'mapping'" :style="{height: '100%', width: '100%'}">
        <MapMenu :params = 'params'/>
        <MapContainer
          :size='size'
          :resolution='resolution'
          :center='center'
        >
          <TileLayer/>
          <template v-for="(param, index) in params">
            <component v-bind:is='param.layer' :param = 'param' :index = 'index' @feaureLoaded='passFeatures'></component>
          </template>
        </MapContainer>
        <!-- 和ol的canvas同属于一个层叠上下文，且层叠顺序相同，所以后来居上，保证Upfitter和label在ol的canvas上面 -->
        <Label  :params = 'params' :features = 'features' :editable='editable' @passContext='bindLabelContext' :printSize = 'printSize'/>
        <Upfitter :params = 'params' :editable='editable'/>
        <Tool @switch='editMapElements' @draw='draw' :editable='editable' :draw='drawType' :params='params'/>
        <!-- <MapLegend :params = 'params' /> -->
    </layout>
    <Print
      v-if="showType === 'print'"
      @toPrintRize='toPrintRize'
      @backToMapping='backToMapping'
      :params = 'params'
      :labelContext='labelContext'
    />
  </layout>
</template>

<script>

  // 制图界面的顶层组件

  import MapMenu from './MapMenu.vue'
  import MapContainer from './MapContainer.vue'
  import TileLayer from './TileLayer.vue'
  import LineLayer from './LineLayer.vue'
  import PointLayer from './PointLayer.vue'
  import PolygonLayer from './PolygonLayer.vue'
  // import Print from './Print.vue'
  // import MapLegend from './Legend.vue'
  import Tool from './Tool.vue'
  import Upfitter from './Upfitter.vue'
  import Label from './Label.vue'
  import { PolylineParam, PointParam, PolygonParam } from '../core/mappingParams.js'
  import observe from '../core/observer.js'

  /****************************/
  var source = new ol.source.Vector();

  var styleFunction = function(feature) {
    var geometry = feature.getGeometry();
    var styles = [
      // linestring
      new ol.style.Style({
        stroke: new ol.style.Stroke({
          color: '#ffcc33',
          width: 2
        })
      })
    ];

    geometry.forEachSegment(function(start, end) {
      var dx = end[0] - start[0];
      var dy = end[1] - start[1];
      var rotation = Math.atan2(dy, dx);
      // arrows
      styles.push(new ol.style.Style({
        geometry: new ol.geom.Point(end),
        image: new ol.style.Icon({
          src: 'https://openlayers.org/en/v4.6.5/examples/data/arrow.png',
          anchor: [0.75, 0.5],
          rotateWithView: true,
          rotation: -rotation
        })
      }));
    });

    return styles;
  };
  var vector = new ol.layer.Vector({
    source: source,
    style: styleFunction
  });

  var added = false;
  /****************************/

  const mappingParams = {
    // 点
    esriGeometryPoint: PointParam,
    // 线
    esriGeometryPolyline: PolylineParam,
    // 面
    esriGeometryPolygon: PolygonParam,
  }

  /**
   * 当参数数组中所有的参数都获得了各自的制图数据之后，调用allDone方法
   * @type {[type]}
   */
  Object.defineProperty( Array.prototype, 'doneRequestParams', {
    set: function(newValue) {
      if( newValue < 0 || newValue > this.length ) return;
      if( newValue === this.length ) this.allDone();
      this._doneRequestParams = newValue;
    },
    get: function() {
      return this._doneRequestParams || 0;
    }
  } )
  // 传入allDone
  Array.prototype.callback = function( fn ) { this.allDone = fn; }

  export default {
    name: 'Mapping',
    components: {
      MapMenu,
      MapContainer,
      TileLayer,
      Label,
      Upfitter,
      Tool,
      LineLayer,
      PointLayer,
      PolygonLayer,
      // Print,
      // MapLegend,
    },
    data () {
      return {
        params: null,
        editable: 'feature', // 当前可编辑的canvas
        drawType: null, // 当前的涂鸦类型，null就是不涂鸦
        features: [],
        painting: null, // 地图上涂鸦的ol.interaction对象
        showType: 'mapping',
        labelContext: null,

        // 地图尺寸，用于打印前后设置尺寸
        size: null,
        // 分辨率
        resolution: null,
        // 地图中心经纬度
        center: null,
      }
    },
    methods: {
      /**
       * 绑定canvas上下文到当前组件
       * @param  {[type]} ctxt [description]
       * @return {[type]}      [description]
       */
      bindLabelContext: function( ctxt ) {
        this.labelContext = ctxt;
      },
      /**
       * 设置地图打印尺寸
       * @return {[type]} [description]
       */
      toPrintRize( size ){
        this.size = size;
      },
      /**
       * 返回制图界面
       * @return {[type]} [description]
       */
      backToMapping() {
        this.showType = 'mapping';
      },
      /**
       * 根据excel读到的数组生成geojson对象
       * @param  {[Array]} a      [excel读到的数组对象]
       * @param  {[Object]} fields [保存了有效字段的对象]
       * @return {[Object]}        [返回GeoJSON对象]
       */
       getGeoJSON: function( a, fields ) {
        var geojson = {
          "type": "FeatureCollection",
          "features": null,
         };

        geojson.features = a.map( function( value, index ) {
          var feature = {
            "type": "Feature",
            "geometry": {
              "type": "Point",
              "coordinates": [ value[ fields.x ], value[ fields.y ] ],
            },
            "properties": {

            }
          }
          return feature;
        } )

        return geojson;
      },
      /**
       * 切换至编辑图面元素或者标注
       * @param string type 要编辑的元素类型字符串
       * @return {[type]} [description]
       */
      editMapElements( type ) {
        if( type === 'print' || type === 'mapping' ) {
          this.showType = type;
          return;
        }
        debugger
        this.editable  = type;
        if( this.editable !== 'feature' ) {
          this.drawType = null;
          this.__global__.olMap.removeInteraction( this.painting );
        }
      },
      /**
       * 涂鸦
       * @param  {string} type 涂鸦的类型
       * @return {[type]}      [description]
       */
      draw:function( type ) {

          var map = this.__global__.olMap;

          if( !added ) { map.addLayer( vector ); added = true; }

          // 两次点选同一个绘制，关闭绘制，或者当当前绘制的canvas不是ol的canvas的时候也关闭绘制
          if( type === this.drawType || this.editable !== 'feature' ) {
            this.drawType = null;
            map.removeInteraction( this.painting );
            return;
          }

          this.drawType = type;

          this.painting = new ol.interaction.Draw({
            source: source,
            type: 'LineString'
          })

          map.addInteraction( this.painting );
      },
      /**
       * 矢量要素图层加载完成后，将要素信息传递给label组件
       * @param Array featureArr 要素数组
       * @param number index 要素对应params的索引
       * @return {[type]} [description]
       */
      passFeatures( index, featureArr ) {
        debugger
        this.features[ index ] = featureArr.map( ( feature, i ) => {
          var a = {};

          // origin属性：标注位置的原点
          switch ( this.params[ index ].layer ) {
            case 'PointLayer':
              a.origin = feature.getGeometry().getCoordinates();
              a.name = feature.values_.HSSTNM;
              break;
            case 'LineLayer':
              // a.origin =
              break;
            case 'PolygonLayer':

              break;
          }

          return a;
        } )
        debugger
      },
    },
    created() {
      /*如果新建走如下流程,如果是编辑模板,则另走服务器获取则直接赋值 */
      // 没有路由缓存，所以，每次路由改变都会重新构建一遍组件
      // 加载
      this.$Spin.show();
      //如果是新建模板
      if(this.__global__.mappingTemplate === null){
        // 获取当前的制图模板类型
        const MAPINGTYPE = this.__global__.type;
        // 获取当前的制图数据数组
        const DATA = this.__global__.mappingData;
        // 制图参数，将传给子组件
        var params = [];

        DATA.forEach( ( value, index ) => {
          // 数据类型，（点线面）
          const DATATYPE = value.geotype;
          // 点线面对应的参数
          const Param = mappingParams[ DATATYPE ] || mappingParams[ "esriGeometryPoint" ];
          var p = new Param();
          // 参数可响应
          observe( p );

          // 如果是系统发布的服务数据
          if( value.type === 'default' ) {

            // 数据源，数据源不需要observable，如果是用户上传的话，会是一个对象，就比较复杂
            p.url = `${value.address}/0/query/?f=json&returnGeometry=true&spatialRel=esriSpatialRelIntersects&geometry=&geometryType=${value.geotype}&outFields=*&where=1=1`;

          }

          // 如果数据是用户上传的数据
          else if( value.type === 'custom' ) {
            // 目前只支持点数据
            p.url = this.getGeoJSON( value.data, value.data.fields )

          }

          p.container = params;
          // 数据名称
          p.name = value.name;
          params.push( p );

        } )
        this.params = params;
        // 已经获取到制图数据源数据的参数个数
        params.doneRequestParams = 0;
        // 数据都添加到地图上后，隐藏加载动画
        const allDone = () => {
          this.$Spin.hide();
          this.params.forEach( ( value ) => { delete value.container } );
        };
        params.callback( allDone );

      }
      // 如果从我的模板进入
      else{
        let templateContent = this.__global__.mappingTemplate;
        // 制图参数，将传给子组件
        let params = [];
        templateContent.forEach( ( value, index ) => {
          // 数据类型，（点线面）
          let DATATYPE = "";
          let layerType = value.layer;
          switch(layerType){
            case "LineLayer":
              DATATYPE = "esriGeometryPolyline"
              break;
            case "PointLayer":
              DATATYPE = "esriGeometryPoint"
              break;
            case "PolygonLayer":
              DATATYPE = "esriGeometryPolygon"
              break;
            default: break;
          }
           // 点线面对应的参数
          const Param = mappingParams[ DATATYPE ];
          var p = new Param();
          // 参数可响应
          observe( p );

          // 通用制图参数初始化
          p.name = value.name;
          p.layer = value.layer;
          p.url = value.url;
          p.showLabels = value.showLabels;
          p.stylePic = value.stylePic;
          p.visible = value.visible;
          p.color = value.color;

          switch(layerType){
            case "LineLayer":
              p.checksum = value.checksum;
              p.interval = value.interval;
              p.lineCap = value.lineCap;
              p.lineDash = value.lineDash;
              p.lineDashOffset = value.lineDashOffset;
              p.lineJoin = value.lineJoin;
              p.miterLimit = value.miterLimit;
              p.width = value.width;
              break;
            case "PointLayer":
              p.crossOrigin = value.crossOrigin;
              p.src = value.src;
              p.opacity = value.opacity;
              p.scale = value.scale;
              p.isGrade = value.isGrade;
              p.gradeCount = value.gradeCount;
              p.gradeField = value.gradeField;
              p.gradeMethod = value.gradeMethod;
              p.stopColor = value.stopColor;
              p.startColor = value.startColor;
              p.isChart = value.isChart;
              p.chartID = value.chartID;
              p.statFields = value.statFields;
              p.colors = value.colors;
              p.isCluster = value.isCluster;
              p.distance = value.distance;
              p.clusterColor = value.clusterColor;
              p.gradeCount = value.gradeCount;
              p.gradeField = value.gradeField;
              p.gradeMethod = value.gradeMethod;
              break;
            case "PolygonLayer":
              p.isGrade = value.isGrade;
              p.gradeCount = value.gradeCount;
              p.gradeField = value.gradeField;
              p.gradeMethod = value.gradeMethod;
              p.stopColor = value.stopColor;
              p.startColor = value.startColor;
              p.stylePic = value.color;
              break;
            default: break;
          }
          p.container = params;

          params.push( p );

        })

        this.params = params;
        // 已经获取到制图数据源数据的参数个数
        params.doneRequestParams = 0;
        // 数据都添加到地图上后，隐藏加载动画
        const allDone = () => {
          this.$Spin.hide();
          this.params.forEach( ( value ) => { delete value.container } );
        };
        params.callback( allDone );
      }

    },
  }

</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

</style>

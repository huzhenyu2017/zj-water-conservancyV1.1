<template>
  <div>
    <slot></slot>
  </div>
</template>

<script>

  const extent =  [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634];
  const esrijsonFormat = new ol.format.EsriJSON();

  var getNextBreak = function() {
    /**
     * 计算两点间间距
     * @param  {Array} p1 第一个点
     * @param  {Array} p2 第二个点
     * @return {number}    两点间间距
     */
    function distanceBetween( p1, p2 ) {
      return Math.sqrt(Math.pow(Math.abs( p1[0] - p2[0] ), 2) + Math.pow(Math.abs( p1[1] - p2[1] ), 2));
    }
    /**
     * 计算在线段p1p2上距离p1距离为delta的点
     * @param  {[type]} p1    [description]
     * @param  {[type]} p2    [description]
     * @param  {[type]} delta [description]
     * @return {[type]}       [description]
     */
    function c( p1, p2, delta ) {
      var d = distanceBetween( p1, p2 );
      var ratio = delta / d;
      var dx = p2[0] - p1[0];
      var dy = p2[1] - p1[1];
      if( isNaN( dx ) || isNaN( dy ) || isNaN( ratio ) || isNaN( d ) ) {
        debugger
      }
      return [ p1[0] + dx * ratio, p1[1] + dy * ratio ];
    }

    /**
     * 计算下一个断点
     * @param  {Array} first 代表上一个断点的数组
     * @param  {number} delta 断点之间的间距
     * @param  {Array} polyLine 代表多段线的数组（剩余的多段线，已经分割好的就不传进来了）
     * @return {Array|Boolean}       下一个断点，如果已经没办法再分一次的话，返回 false
     */
    return function ( first, delta, polyLine ) {

      // 如果下一个断点在polyLine[0]和first之间
      var distance = distanceBetween( first, polyLine[ 0 ] );
      if( distance > delta ) {
        return c( first, polyLine[0], delta );
      }

      // 保存到first的长度刚刚大于delta的点的索引
      var index = 0;
      var distanceOld = 0;

      while ( distance < delta ) {
        // 如果已经到最后了，还不够分一次的话，返回 false
        if( !polyLine[ index + 1 ] ) return false;
        distanceOld = distance;
        distance += distanceBetween( polyLine[ index ], polyLine[ ++index ] )
      }

      var p1 = polyLine[ index -1 ];
      var p2 = polyLine[ index ];
      var d = delta - distanceOld;

      // 去掉已经分段好的部分
      polyLine.splice( 0, index );

      return c( p1, p2, d );



    }
  }()

  export default {
    name: 'linelayer',
    props: ['param', 'index'],
    data() {
      return {
        _olLayer: null, // 用来在内部保存layer的引用
      }
    },
    created() {

      /**
       * 矢量图层
       */

      var param = this.param;
      var scope = this;

       var vectorSource = new ol.source.Vector({
       loader: function(extent, resolution, projection) {
         var url = param.url;
         $.ajax({url: url, dataType: 'jsonp', success: function(response) {
           if (response.error) {
             alert(response.error.message + '\n' +
                 response.error.details.join('\n'));
           } else {
             // dataProjection will be read from document
             var features = esrijsonFormat.readFeatures(response, {
               featureProjection: projection
             });
             if (features.length > 0) {
               vectorSource.addFeatures(features);

               scope.$emit( 'feaureLoaded', scope.index, features );
             }

             // 通知顶层数据已经添加到地图上了
             param.container.doneRequestParams++;
           }
         }});
       },
     });

     // 初始的样式
     var initialStyle = new ol.style.Style({
       // fill: new ol.style.Fill({
       //   color: 'rgba(225, 225, 225, 255)'
       // }),
       stroke: new ol.style.Stroke( this.param )
     });

     this._olLayer = new ol.layer.Vector({
       source: vectorSource,
       style: initialStyle
     });

      // 图层对象都要定义一个update函数，用于实时更新制图参数
      this._olLayer.update = function() {

        // var map = scope.__global__.olMap || null;
        // var maxZoom = map && map.getView().getMaxZoom();
        // var minZoom =  map && map.getView().getMinZoom();


        /**
         * 根据制图参数生成样式
         * @return {[type]} [description]
         */
        function styleGenerator() {
          // 如果是自定义样式
          if( param.custom ) {
            switch (param.custom) {
              case 'dot':
                return [
                   new ol.style.Style({
                     stroke: new ol.style.Stroke(param)
                   }),
                   new ol.style.Style({
                     image: new ol.style.Circle({
                       radius: param.width * 1.25,
                       // radius: param.width * 2,
                       fill: new ol.style.Fill({
                         color: param.color
                       })
                     }),
                     geometry: function(feature) {
                       // 每次重绘都会调用（拖拽、缩放都包括）
                       var map = scope.__global__.olMap || null;
                       var maxZoom = map && map.getView().getMaxZoom();
                       var minZoom =  map && map.getView().getMinZoom();
                       var coordinates = feature.getGeometry().getCoordinates();
                       var a = [], p, first;
                       // 样式间隔
                       var delta = param.interval;
                       // var delta = 0.00009725575650549532 * Math.pow( ( 24 - map.getView().getZoom() ), 2 );
                       // 有可能是multiLineString
                       if( typeof coordinates[0][0] == 'object' ) {
                         coordinates.forEach( function( value ) {
                           // 如果是multiLineString的话，那么子元素都还是数组，孙子元素也是数组但是代表的是一个坐标
                           // value代表一条线。包含线上所有的拐点和端点
                           first = value[ 0 ];
                           while( p = getNextBreak( first, delta, value ) ) {
                             a.push( p );
                             first = p;
                           }
                           // 获取当前的缩放等级
                           // var zoom = map.getView().getZoom();
                         } )
                       } else {
                         first = coordinates[ 0 ];
                         while( p = getNextBreak( first, delta, coordinates ) ) {
                           a.push( p );
                           first = p;
                         }
                       }
                       return new ol.geom.MultiPoint(a);
                     }
                   }),
                 ]
                break;
              case 'cross':
                return [
                  new ol.style.Style({
                    stroke: new ol.style.Stroke(param)
                  }),
                  new ol.style.Style({
                    image: new ol.style.Circle({
                      radius: param.width * 1.25,
                      // radius: param.width * 2,
                      fill: new ol.style.Fill({
                        color: param.color
                      })
                    }),
                    geometry: function(feature) {
                      // 每次重绘都会调用（拖拽、缩放都包括）
                      var map = scope.__global__.olMap || null;
                      var maxZoom = map && map.getView().getMaxZoom();
                      var minZoom =  map && map.getView().getMinZoom();
                      var coordinates = feature.getGeometry().getCoordinates();
                      var a = [], p, first;
                      // 样式间隔
                      var delta = param.interval;
                      // var delta = 0.00009725575650549532 * Math.pow( ( 24 - map.getView().getZoom() ), 2 );
                      // 有可能是multiLineString
                      if( typeof coordinates[0][0] == 'object' ) {
                        coordinates.forEach( function( value ) {
                          // 如果是multiLineString的话，那么子元素都还是数组，孙子元素也是数组但是代表的是一个坐标
                          // value代表一条线。包含线上所有的拐点和端点
                          first = value[ 0 ];
                          while( p = getNextBreak( first, delta, value ) ) {
                            a.push( p );
                            first = p;
                          }
                          // 获取当前的缩放等级
                          // var zoom = map.getView().getZoom();
                        } )
                      } else {
                        first = coordinates[ 0 ];
                        while( p = getNextBreak( first, delta, coordinates ) ) {
                          a.push( p );
                          first = p;
                        }
                      }
                      return new ol.geom.MultiPoint(a);
                    }
                  }),
                ]

                break;
              default:

            }

          } else {
            return new ol.style.Style({
              stroke: new ol.style.Stroke( param )
            })
          }
        }





        return function() {
          this.setStyle( styleGenerator() );
          // 图层是否可见
          param.visible? this.setVisible( true ) : this.setVisible( false );
        }
      }()

      // 将制图参数和图层对象绑定
      this.param.__myob__.dep.addSub( this._olLayer );

      // 将当前图层添加到ol.Map中
      this.$nextTick(t => this.$parent.$emit("addtile", this._olLayer));

    },
  }
</script>

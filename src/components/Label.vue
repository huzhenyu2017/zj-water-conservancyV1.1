<template lang="html">
  <canvas ref="label" class="label"></canvas>
</template>

<script>
const Y = 64;

export default {
  name: 'Label',
  props: [ 'params', 'editable', 'features', 'printSize' ],
  data() {
    return {
      canvassize: null, // 画布大小（[width,height]）
      active: false,
      ctxt: null, // canvas的二维绘图上下文
      showList: null, // 数组，元素为布尔型，用于保存哪些要素图层需要渲染注记
      fontsize: 20, // 字体大小
    }
  },
  watch: {
    params: {
      /**
       * 监听params制图参数的变化，用于实时更新是否显示标注
       * @return {[type]} [description]
       */
      handler: function( params ) {
        this.showList = params.map( function( param, i ) {
          return param.showLabels;
        } )
        this.renderLabels();
      },
      deep: true,
    },
    /**
     * 监听打印尺寸，如果不为空，按打印尺寸重设
     * @type {[type]}
     */
    printSize: function( nv ) {
      debugger
      if( nv ) {
        this.canvasResize( nv );
        // 全部绘制
        this.renderLabels();
      }
    },
    /**
     * 标注元素是否可编辑
     * @param  {[Boolean]} nv [新值]
     * @param  {[Boolean]} ov [旧值]
     * @return {[type]}    [description]
     */
    editable: function( nv, ov ) {
      // 使用computed属性的话，切换editable后的效果没有马上出现，watch没有这个问题
      // 改变触发鼠标事件的canvas
      if( nv === 'label' ) {
        this.$refs.label.style[ 'pointer-events' ] = 'auto';
        this.active = true;
      } else {
        this.$refs.label.style[ 'pointer-events' ] = 'none';
        this.active = false;
      }
    },

  },
  methods: {
    /**
     * 设置画布大小
     * @param {Array} printSize 打印尺寸
     * @return {[type]} [description]
     */
    canvasResize( printSize ) {
      // 获取ol画布大小
      this.canvassize = printSize || this.__global__.olMap.getSize();
      // 设置upfitter的canvas大小，其他方式设置的会被拉伸
      this.$refs.label.width = this.canvassize[ 0 ];
      this.$refs.label.height = this.canvassize[ 1 ];
    },

    /**
     * 绘制注记
     * @return {[type]} [description]
     */
    renderLabels() {
      var features = this.features;
      var ctxt = this.ctxt;
      // 清空画布
      ctxt.clearRect( 0, 0, ...this.canvassize );

      // 获取地图坐标系到当前canvas坐标系的转换矩阵
      // object，其中包含了像素<-->地图坐标系的转换矩阵
      var frameState = this.__global__.olMap.frameState_;

      if( !frameState || !this.showList || this.showList.every(function( value ) { return !value}) || !this.features.length ) return;
      //线条宽度
      ctxt.lineWidth = 2;
      //线条颜色
      ctxt.strokeStyle = "#058";
      // 线头样式
      ctxt.lineCap = "round";

      this.showList.forEach( ( value, index ) => {

        if( !value ) return;
        // 遍历要素
        this.features[ index ].forEach( ( featureInfo ) => {
          // 获取要素在地图坐标系下的坐标
          // 经纬度坐标转换为ol Canvas 像素坐标
          // !!ol.transform.apply会改写featureInfo.origin，所以传入featureInfo.origin的备份
          // 有moveTo属性说明移动过了，就用移动过的坐标
          let moved = featureInfo.hasOwnProperty( 'moveTo' );
          let coordinate = moved? featureInfo.moveTo :  featureInfo.origin;
          coordinate = ol.transform.apply( frameState.coordinateToPixelTransform, coordinate.slice() );

          // 如果在canvas可视范围之外，就跳过绘制
          if( !((coordinate[ 0 ] > 0 && coordinate[ 0 ] < this.canvassize[ 0 ]) && ( coordinate[ 1 ] > 0 && coordinate[ 1 ] < this.canvassize[ 1 ] )) ) return;

          // 绘制标注
          if( moved ) {
            ctxt.beginPath();
            ctxt.moveTo( ...ol.transform.apply( frameState.coordinateToPixelTransform, featureInfo.origin.slice() ) );
            ctxt.lineTo( ...coordinate );
            ctxt.stroke();
          }


          ctxt.font=`bold ${this.fontsize}px Arial`;
          ctxt.fillStyle="#058";
          ctxt.fillText( featureInfo.name, ...coordinate );



        } )

      } )

    },
  },
  mounted() {
    var map = this.__global__.olMap;

    // 鼠标操作无视这层canvas，这样就能在下一层的ol的canvas触发鼠标事件
    this.$refs.label.style[ 'pointer-events' ] = 'none';
    this.ctxt = this.$refs.label.getContext( "2d" );
    // this.$emit( 'passContext', this.ctxt );
    this.$emit( 'passContext', this.$refs.label );

    // 设置当前canvas大小
    if( this.__global__.olMap ) {
      this.canvasResize();
    }
    // 当窗口大小改变的时候重新设置canvas的大小
    //
    if (window.addEventListener) {
      window.addEventListener('resize', () => {
        this.canvasResize();
        // 全部绘制
        this.renderLabels();
      }, false);
    } else if (window.attachEvent)  {
      window.attachEvent('onresize', () => {
        this.canvasResize();
        // 全部绘制
        this.renderLabels();
      });
    }


    // 直接在mounted中调用，frameState_还没有初始化，在队列中中调用没问题
    setTimeout( () => {

      // 初始绘制
      this.renderLabels();

      // 当地图发生变化的时候（拖拽缩放），重绘注记
      // 弃用change事件。change事件只在拖拽结束或缩放结束的时候触发
      // map.getView().on( 'change', () => {
      //   this.renderLabels();
      // } )

      map.on( 'pointerdrag', () => {
        this.renderLabels();
      } )
      map.getView().on('change:resolution',() => {
        this.renderLabels();
      });

    }, 0)

    // 绑定鼠标点击事件
    this.$refs.label.onmousedown = ( ev ) => {
      // 鼠标事件的y坐标需要坐标转化，减去上面一条header
      var e = ev || event;
      var x = e.clientX;
      var y = e.clientY - Y;

      // 获取地图坐标系到当前canvas坐标系的转换矩阵
      // object，其中包含了像素<-->地图坐标系的转换矩阵
      var frameState = this.__global__.olMap.frameState_;
      // 判断是否点击在任何一个注记上
      this.features.forEach( ( features, index ) => {
        if( !this.params[ index ].showLabels ) return;
        features.forEach( ( featureInfo, index ) => {

          let coordinate = featureInfo.hasOwnProperty( 'moveTo' )? featureInfo.moveTo :  featureInfo.origin

          coordinate = ol.transform.apply( frameState.coordinateToPixelTransform, coordinate.slice() );
          // 如果在canvas可视范围之外，就跳过
          if( !((coordinate[ 0 ] > 0 && coordinate[ 0 ] < this.canvassize[ 0 ]) && ( coordinate[ 1 ] > 0 && coordinate[ 1 ] < this.canvassize[ 1 ] )) ) return;

          if( ( x > coordinate[ 0 ] && x < coordinate[ 0 ] + this.ctxt.measureText(featureInfo.name).width ) && ( y < coordinate[ 1 ] && y > coordinate[ 1 ] - this.fontsize ) ) {
            // 鼠标点击位置与注记左下角的差值
            let dx = x - coordinate[0];
            let dy = y - coordinate[1];

            this.$refs.label.onmousemove = ( ev ) => {
              var e = ev || event;
              // 计算注记新的左下角点的canvas坐标
              var x = e.clientX - dx;
              var y = e.clientY - Y - dy;
              // 保存新的经纬度坐标
              featureInfo.moveTo = ol.transform.apply( frameState.pixelToCoordinateTransform, [ x, y ] );
              this.renderLabels();
            }
            // 鼠标抬起后清空事件监听
            this.$refs.label.onmouseup = function() {
              this.onmousemove = null;
              this.onmouseup = null;
            }
            return;
          }

        } )
      } )
    }


  }
}
</script>

<style lang="css">
  .label {
    position: absolute;
  }
</style>

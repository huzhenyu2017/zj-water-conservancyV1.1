/**
 *
 * vue源码 src\core\observer\index.js defineReactive
 *
 * vue.$watch:
 * a:被观察的对象实例
 * observe( a ) -->  创建a的observer对象 --> a的每个成员属性都执行一次 defineReactive（如果属性成员b是对象，就再执行一次observe(b)）
 * a的成员属性，在执行了defineReactive之后，就都获得了新的setget函数。
 * 在a的observer对象中，还有一个Dep类型的实例，维护了依赖a的所有观察者。
 * 在a的属性变化的时候，也就是调用了a成员属性的新的get函数，新的get函数会执行dep.notify，提醒观察者们数据变动
 *
 * 参考这个方式，实现，openlayers图层随制图参数改变而自动更新
 */

function PolylineParam(type) {

  PublicProp.call( this, 'LinePanel', 'LineLayer' );

  /**
   *
   * @type {ol.Color|ol.ColorLike}
   */
  this.color = 'rgba(255, 169, 0, 1)';

  /**
   *
   * @type {string|undefined}
   */
  this.lineCap = null;

  /**
   *
   * @type {Array.<number>}
   */
  this.lineDash = null;

  /**
   *
   * @type {number|undefined}
   */
  this.lineDashOffset = null;

  /**
   *
   * @type {string|undefined}
   */
  this.lineJoin = null;

  /**
   *
   * @type {number|undefined}
   */
  this.miterLimit = null;

  /**
   *
   * @type {number|undefined}
   */
  this.width = 0.4;

  /**
   *
   * @type {string|undefined}
   */
  this.checksum = undefined;

  /**
   * 标识自定义的线型
   * @type {[type]}
   */
  this.custom = null;

  this.interval = 1;

  /**
   * 用于图例遍历样式
   * @type {String}
   */
  this.stylePic = './static/LineLayer/template1/实线.png';

};

function PointParam( type ) {

  PublicProp.call( this, 'PointPanel', 'PointLayer' );

  this.color = '#576C84';
  this.crossOrigin = 'anonymous';
  // this.src = 'https://openlayers.org/en/v4.6.4/examples/data/dot.png';
  this.src = this.stylePic = './static/2.png';
  this.opacity = 1;

  this.scale = 0.1;

  // 是否是分级设色------------分级相关参数
  this.isGrade = false;
  // 分级设色分级数
  this.gradeCount = 3;
  // 分级字段
  this.gradeField = 'OBJECTID';
  // 分段方法
  this.gradeMethod = '等间距分段';
  // 终止颜色
  this.stopColor = '#99490f';
  // 起始颜色
  this.startColor = '#fee9da';


  // 是否是统计图表-----------------统计相关参数
  this.isChart = false;
  // 默认图表id
  this.chartID = '010101';
  // 统计图表的制图字段
  this.statFields = [];
  // 字段对应颜色的默认值
  this.colors = [ '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d', '#ffc12a', '#ffff3a', '#90cf5b', '#00af57', '#00afee', '#0071be', '#00215f', '#72349d' ];

  // 是否是聚类统计--------------聚类相关参数
  this.isCluster = false;
  // 集群间距
  // 集群之间的最小距离（像素）。默认是20。
  this.distance = 20;
  // 聚类符号的背景颜色
  this.clusterColor = '#3399CC';

  // 分级设色分级数
  this.gradeCount = 3;
  // 分级字段
  this.gradeField = 'OBJECTID';
  // 分段方法
  this.gradeMethod = '等间距分段';


}

function PolygonParam( type ) {

  PublicProp.call( this, 'PolygonPanel', 'PolygonLayer' );
  this.color = '#FFFF00';
  // 是否是分级设色
  this.isGrade = false;
  // 分级设色分级数
  this.gradeCount = 3;
  // 分级字段
  this.gradeField = 'OBJECTID';
  // 分段方法
  this.gradeMethod = '等间距分段';
  // 终止颜色
  this.stopColor = '#99490f';
  // 起始颜色
  this.startColor = '#fee9da';

  this.stylePic = this.color;

}

/**
 * 公共的属性
 * @param       {[type]} panel [description]
 * @param       {[type]} layer [description]
 * @constructor
 */
function PublicProp( panel, layer ) {
  // 是否可见
  this.visible = true;

  // 是否显示注记信息
  this.showLabels = false;
  // // 数据源
  // this.url = null;
  // 对应的图层类型
  this.layer = layer;
  // 对应的面板类型
  this.panel = panel;
  // 保存样式图片的地址
  this.stylePic = null;
}



export {
  PolylineParam,
  PointParam,
  PolygonParam,
}

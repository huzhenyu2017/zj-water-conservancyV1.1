<script>
/**
 * 用于存放项目的全局变量，如制图参数，制图类型等
 * @type {[type]}
 */
  export default
  {
    // 制图数据

    mappingData:[],
    // 制图类型
    type: null,
    /*
    geotype 用于保存当前数据是点线面中的哪一种
    type保存的是当前数据类型 default是服务数据， custom是用户上传数据
    template保存了可以用于哪种制图模板
     */
    allData: [
      {"name":"水库","geotype":"esriGeometryPolygon","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuiku/MapServer"},
      {"name":"泵站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6079/arcgis/rest/services/zjsl/bengzhan/MapServer"},
      {"name":"堤防工程","geotype":"esriGeometryPolyline","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/difanggongcheng/MapServer"},
      {"name":"灌区工程","geotype":"esriGeometryPolygon","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/guanqugongcheng/MapServer"},
      {"name":"海塘","geotype":"esriGeometryPolyline","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/haitang/MapServer"},
      {"name":"河流","geotype":"esriGeometryPolygon","type":"default","template":["template1"],"address":" http://114.215.249.116:6080/arcgis/rest/services/zjsl/heliu/MapServer"},
      {"name":"湖泊","geotype":"esriGeometryPolygon","type":"default","template":["template1"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/hupo/MapServer"},
      {"name":"农村供水工程","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://114.215.249.116:6079/arcgis/rest/services/zjsl/nongcungongshuigongcheng/MapServer"},
      {"name":"山塘","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shantang/MapServer"},
      {"name":"水电站","geotype":"esriGeometryPoint","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuidianzhan/MapServer"},
      {"name":"水文测站","geotype":"esriGeometryPoint","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuiwencezhan/MapServer"},
      {"name":"水闸","geotype":"esriGeometryPolyline","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuizha/MapServer"},
      {"name":"围垦","geotype":"esriGeometryPolygon","type":"default","template":["template2","template3"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/weiken/MapServer"},
      {"name":"引调水","geotype":"esriGeometryPolyline","type":"default","template":["template2"],"address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/yindiaoshui/MapServer"},
    ],

  /* 测试时使用的数据 */ 
    mappingData:[
    //     // {"id":"0","type":"default","name":"水库","geotype":"esriGeometryPolygon","address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuiku/MapServer"},
    //     {"id":"12","type":"default","name":"围垦","geotype":"esriGeometryPolygon","address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/weiken/MapServer"},
    //     {"id":"10","type":"default","name":"水文测站","geotype":"esriGeometryPoint","address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/shuiwencezhan/MapServer"},
    //     {"id":"2","type":"default","name":"堤防工程","geotype":"esriGeometryPolyline","address":"http://114.215.249.116:6080/arcgis/rest/services/zjsl/difanggongcheng/MapServer"},
    ],
    // 制图类型
    // type: 'template2',

    // 地图范围
    extent: [118.02252448821446,  27.04527653758214, 123.15774781361063, 31.18247145139634],

    olMap: null, // 用于保存地图对象

    mappingTemplate:null,//用于保存当前制图模板内容

    templateId:null, //用于保存当前制图模板id

    templateName:null,//用于保存当前制图模板名称

    templateDiscription:null,//用于保存当前制图模板描述

    templateRight:null,//用于保存当前制图模板权限

    templateUser:null,//用于保存当前制图模板权限

  }
</script>

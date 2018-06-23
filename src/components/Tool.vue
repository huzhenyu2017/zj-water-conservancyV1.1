<template lang="html">
  <div class="toolbar" v-if="isShowTool">
    <div v-if="editable === 'feature'" :class = "{ 'using': draw === 'arrow' }" @click="drawChangeTo('arrow')"><Icon :size='iconsize' type="arrow-graph-up-right" title="地图标绘"></Icon></div>
    <div :class = "{ 'current': editable === 'label' }" @click="editMapElements('label')"><Icon :size='iconsize' type="android-textsms" title="编辑注记"></Icon></div>
    <div :class = "{ 'current': editable === 'map' }" @click="editMapElements('map')"><Icon :size='iconsize' type="map" title="地图整饰"></Icon></div>
    <div :class = "{ 'current': editable === 'feature' }" @click="editMapElements('feature')"><Icon :size='iconsize' type="earth" title="地图操作"></Icon></div>
    <div @click="editMapElements('print')"><Icon :size='iconsize' type="printer" title="打印地图"></Icon></div>
    <div @click="saveTemplate()"><Icon :size='iconsize' type="upload" title="上传模板"></Icon></div>
    <!-- button "save" -->
  </div>
  <div v-else class="formDiv">
     <Form :model="formItem" :label-width="80" class="formClass">
     	<p class="formTitle">制图模板保存</p>
        <FormItem label="模板名称" style="font-size: 16px;">
            <Input v-model="formItem.input" placeholder="请输入模板名称..." style="padding-right: 20px;"></Input>
        </FormItem>
        <FormItem label="模板权限">
            <RadioGroup v-model="formItem.radio">
                <Radio label="公开">公开</Radio>
                <Radio label="个人">个人</Radio>
            </RadioGroup>
        </FormItem>
        <FormItem label="模板描述">
            <Input v-model="formItem.textarea" type="textarea" :autosize="{minRows: 2,maxRows: 5}" placeholder="请输入对制图模板的描述..." style="padding-right: 20px;"></Input>
        </FormItem>
        <FormItem>
            <Button type="primary" style="margin-left: 34px" @click="upload()">上传</Button>
            <Button type="ghost" style="margin-left: 60px" @click="quitSave()">取消</Button>
        </FormItem>
    </Form>
  </div>
</template>

<script>
export default {
  name: 'Tool',
  props: ['editable', 'draw' ,'params'],
  data() {
    return {
      iconsize: 35,
      isShowTool: true,
      formItem: {
        input: '',  
        radio: '公开',
        textarea: ''
      }
    }
  },
  mounted(){
    if(this.__global__.templateId!=null){
      this.formItem.input = this.__global__.templateName;
      this.formItem.radio = this.__global__.templateRight;
      this.formItem.textarea = this.__global__.templateDiscription;
    }
  },
  methods: {
    /**
     * 地图输出打印
     * @return {[type]} [description]
     */
    exportMap() {
      this.$router.push({path: '/print'});
    },
    /**
     * 切换至编辑图面元素
     * @param [string] type 要转换的模式字符串
     * @return {[type]} [description]
     */
    editMapElements( type ) {
      this.$emit( 'switch', type );
    },
    /**
     * 选择涂鸦的类型
     * @param  {string} type 选择的涂鸦类型
     * @return {[type]}      [description]
     */
    drawChangeTo( type ) {
      this.$emit( 'draw', type );
    },

    //点击保存模板按钮(弹出表单)
    saveTemplate(){
      this.isShowTool = false;
    },

    //取消保存按钮(隐藏表单)
    quitSave(){
      this.isShowTool = true;
    },

    upload(){
      if(this.__global__.templateId!=null){
        //update模板
        let obj = {
          name:this.formItem.input,
          discription:this.formItem.textarea,
          template:JSON.stringify(this.params),
          right:this.formItem.radio,
          templateId:this.__global__.templateId
        };
        var options = {
            method: 'POST',
            headers: {
                // "Content-type": "application/json"
            },
            body:JSON.stringify(obj)
        };
        fetch(`http://localhost:6081/updateTemplate`,options)
        .then(response=>response.json())
          .then(json=>{
            if(json.message === "success"){
              this.isShowTool = true;
               alert("更新模板成功!");
            }else{
              alert(json);
            }
        });

      }else{
        //insert模板
        //jsonStr.name,jsonStr.user,jsonStr.discription,jsonStr.template,date,jsonStr.right,jsonStr.category,jsonStr.temtype,jsonStr.visible,jsonStr.pic
        var categoryTemp;
        switch(this.__global__.type){
          case "template1": categoryTemp = "自然类"
            break;
          case "template2": categoryTemp = "工程类"
            break;
          case "template3": categoryTemp = "管理类"
            break;
          default:
            break;
        }  
        
        let obj = {
          name:this.formItem.input,
          user:this.__global__.templateUser,
          discription:this.formItem.textarea,
          template:JSON.stringify(this.params),
          right:this.formItem.radio,
          category: categoryTemp,
          temtype:"custom",
          visible:true,
          pic:"http://localhost:3009/static/pic/zrsx.png"
        };
        var options = {
            method: 'POST',
            headers: {
                // "Content-type": "application/json"
            },
            body:JSON.stringify(obj)
        };
        fetch(`http://localhost:6081/saveTemplate`,options)
        .then(response=>response.json())
          .then(json=>{
            if(json.message === "success"){
              this.isShowTool = true;
              alert("创建模板成功!");
            }else{
              alert(json);
            }
        });
      }
     
    }

  }

}
</script>

<style scoped>
  .toolbar {
    position: absolute;
    top: 75px;
    right: 15px;
    /* width: 300px;
    height: 100px; */
    /* background-color: #f90; */
    display: flex;
    justify-content: center;
  }
  .toolbar > div {
    border-radius: 50%;
    background-color: #56aee2;
    margin: 0 4px;
    width: 55px;
    display: flex;
    justify-content: center;
  }
  .toolbar > div.current {
    background-color: #f90;
  }
  .toolbar > div.using {
    background-color: #0f0;
  }
  .ivu-icon {
    margin: 10px auto;
    cursor: pointer;
    color: #fff;
  }
  .formClass {
    background-color: #fff;
    padding: 0;
    width: 100%;
    height: 100%;
    
  }
  .formDiv{
    position: absolute;
    top: calc(50vh - 180px);
    right: calc(50vw - 200px);
    width: 400px;
    height: 360px;
    display: flex;
    border:1px solid #BFBFBF;
    box-shadow:5px 5px 10px 5px #aaa;
  }
  .formTitle{
  	text-align: center;
  	margin-top: 30px;
  	margin-bottom: 30px;
  	font-size: 20px;
  	font-weight: bold;
  }
   /*.fontsize.ivu-form-item

 .ivu-form-item-label{
    font-size: 20px;
   }            */
</style>

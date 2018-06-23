<template>
  <div class="cont-mymap">

    <div class="cont-filtasearch">
      <div class="filter">
        <Dropdown class="filterItem" trigger="click" style="margin-left: 20px" @on-click="rightFilter">
            <a href="javascript:void(0)" class="filterName" @click="rightClick">
                {{rightItem}}
                <Icon type="arrow-down-b" v-if="rightDownShow"></Icon>
                <Icon type="arrow-up-b" v-if="rightUpShow"></Icon>
            </a>
            <Dropdown-menu slot="list" >
                <Dropdown-item class="filterItem" name="全部权限">全部权限</Dropdown-item>
                <Dropdown-item class="filterItem" name="公开">公开</Dropdown-item>
                <Dropdown-item class="filterItem" name="个人">个人</Dropdown-item>
            </Dropdown-menu>
        </Dropdown>
        <Dropdown class="filterItem" trigger="click" style="margin-left: 20px"  @on-click="categoryFilter">
            <a href="javascript:void(0)" class="filterName" @click="categoryClick">
                {{categoryItem}}
                <Icon type="arrow-down-b" v-if="categoryDownShow"></Icon>
                <Icon type="arrow-up-b" v-if="categoryUpShow"></Icon>
            </a>
            <Dropdown-menu slot="list">
                <Dropdown-item class="filterItem" name="全部类别">全部类别</Dropdown-item>
                <Dropdown-item class="filterItem" name="自然类">自然类</Dropdown-item>
                <Dropdown-item class="filterItem" name="工程类">工程类</Dropdown-item>
                <Dropdown-item class="filterItem" name="管理类">管理类</Dropdown-item>
            </Dropdown-menu>
        </Dropdown>
        <sort ref="sort" :list="tempSelfList" :allist="allSelfList"  @sortResult="sortResult"/>
      </div>
      <search :allist="allSelfList" @searchResult="searchResult"> </search>
    </div>
    <div class="cont2-template">
      <mapTemplate class="maptemplate"  v-for='(item, index) in tempSelfList' :key="index" v-if="Boolean(item.VISIBLE)===true"
      :pic='item.PIC' :name='item.NAME' :discription='item.DISCRIPTION'
      :category='item.CATEGORY' :author='item.USER' :time='item.DATE'
      :right='item.AUTHORITY' :temtype='item.TEMTYPE' :visible='Boolean(item.VISIBLE)' 
      :template='item.TEMPLATE' :templateId='item.ID'
      />
      <!-- v-if='item.visible===true' 问题出现在mysql中没有bool类型,所以存储的ture/false为字符串类型 -->
    </div>
</div>

</template>

<script>
//我的专题图所有专题图作者均为本用户

import mapTemplate from './MapTemplate';
import search from './Search';
import sort from './Sort';
export default {
  components: {mapTemplate, search,sort},

data () {
  return {
    //筛选下拉符号
    rightDownShow: true,
    rightUpShow: false,
    categoryDownShow: true,
    categoryUpShow: false,

    rightItem: '全部权限',
    categoryItem: '全部类别',
    //全部专题图
    allSelfList: 
    [
    //   {
    //    'pic': '/static/pic/zrsx.png',
    //    'name': '水',
    //    'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
    //    'category': '自然类',
    //    'author': 'user1',
    //    'time': '2018-5-21-19:01',
    //    'right': '公开',
    //    'temtype': 'custom',
    //    'visible': true
    //  },
    //  {
    //    'pic': '/static/pic/zrsx.png',
    //   'name': '河',
    //   'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
    //   'category': '自然类',
    //   'author': 'user1',
    //   'time': '2018-5-21-19:02',
    //   'right': '公开',
    //   'temtype': 'custom',
    //   'visible': true
    // },
    //    {
    //      'pic': '/static/pic/zrsx.png',
    //     'name': '水河',
    //     'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
    //     'category': '工程类',
    //     'author': 'user1',
    //     'time': '2018-5-20-19:02',
    //     'right': '个人',
    //     'temtype': 'custom',
    //     'visible': true
    //   },
    //   {
    //     'pic': '/static/pic/zrsx.png',
    //    'name': 'g水利',
    //    'discription':'自然类模板表达自然水系的分布情况，包括河流、湖泊数据。',
    //    'category': '工程类',
    //    'author': 'user1',
    //    'time': '2018-5-20-20:01',
    //    'right': '个人',
    //    'temtype': 'custom',
    //    'visible': true
    //  }
   ],
   //模板页显示专题图实际列表
  tempSelfList: [],
  //搜索结果
  searchResultList: [],
  //筛选结果
  filterResultList: [],
  //筛选临时存储
  filterTemp: []
  }
},
mounted () {
  //初始显示、筛选结果、搜索结果均为全部专题图,
 
  //     this.tempSelfList = this.allSelfList;
  //     this.filterResultList = this.allSelfList;
  //     this.searchResultList = this.allSelfList;
  //     //初始排序为时间倒序
  //     this.tempSelfList.sort(this.$refs.sort.compare("time")).reverse();
  var username = "admin";
  fetch(`http://localhost:6081/allTemplates?user=${username}`)
    .then(response=>response.json())
    .then(json=>{
      //this.allSelfList = json.templateContent;//生命周期钩子的 this 上下文指向调用它的 Vue 实例(这里的实例是app)
      //针对数组data的变化,需要用特殊的方式进行视图变化检测激活!
      for(var obj of json.templateContent){
        // console.log(obj);
        this.allSelfList.push(obj);
      }
  });
  this.tempSelfList = this.allSelfList;
  this.filterResultList = this.allSelfList;
  this.searchResultList = this.allSelfList;
  this.filterTemp = this.allSelfList;
  //初始排序为时间倒序
  this.tempSelfList.sort(this.$refs.sort.compare("time")).reverse();   
},
created () {
  this.__global__.mappingData = [];
},
methods: {
  //权限筛选
  rightFilter (key) {
    this.rightClick();
    this.rightItem = key;
    if (key === '全部权限') {
      this.allSelfList.forEach(item => {
          item.visible = true;
          this.filterTemp = this.allSelfList;
      });
    }else{
      this.allSelfList.forEach(item => {
        if(item.right !== key) {
          item.visible = false;
        }else {
          item.visible = true;
          this.filterTemp.push(item);
        }
      });
    }
    this.filterResultList = this.filterTemp;
    this.filterTemp = [];
    this.showTemplate(this.filterResultList, this.searchResultList);
  },
  //类别筛选
  categoryFilter (key) {
    this.categoryItem = key;
    this.categoryClick();
    if (key === '全部类别') {
      this.allSelfList.forEach(item => {
          item.visible = true;
          this.filterTemp = this.allSelfList;
      });
    }else{
      this.allSelfList.forEach(item => {
        if(item.category !== key) {
          item.visible = false;
        }else {
          item.visible = true;
          this.filterTemp.push(item);
        }
      });
    }
    this.filterResultList = this.filterTemp;
    this.filterTemp = [];
    this.showTemplate(this.filterResultList, this.searchResultList);
  },

  //搜索结果
  searchResult (result) {
    this.searchResultList = result;
    this.showTemplate(this.filterResultList, this.searchResultList);
  },
  //排序结果
  sortResult (result) {
    this.tempSelfList = result;
  },
  //最终显示的专题图，搜索与筛选结果求交
  showTemplate (filter, search) {
    var filter = new Set(filter);
    var search = new Set(search);
    this.tempSelfList = Array.from(new Set([...filter].filter(item => search.has(item))));
  },
  //类别筛选图标变化
  categoryClick () {
    this.categoryUpShow = !this.categoryUpShow;
    this.categoryDownShow = !this.categoryDownShow;
  },
  //权限筛选图标变化
  rightClick () {
    this.rightUpShow = !this.rightUpShow;
    this.rightDownShow = !this.rightDownShow;
  }
}
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

.cont {
  display: flex;
  flex: 1;
  background-color:#e2e2e2;
  flex-direction: column;
  /* overflow: auto; */
}
.cont2-template {
  display: flex;
  flex-direction: row;
  justify-content: flex-start;
  margin-top: 10px;
   flex-wrap:  wrap;

}
.filter {
  width: 100%;
  height: 5%;
  display: flex;
  flex: 1;
  align-items: center;
}
.filterName {
  color: #5e5e5e;
  font-size: 16px;

}
.filterItem {
  size: 22px;
  width: 100px;
}

.searchbtn {
  border-radius: 5px;
  width: 70px;
  height: 30px;
  background-color: #fff;
  font-size: 16px;
  vertical-align: middle;
}
.hrule {
  size: 30;
}
.maptemplate {
  width: 400px;
  margin: 50px;

}
.cont-filtasearch {
  display: flex;
  flex: 1;
  flex-direction: row;
  align-items: center;
  background-color: #f2f2f2;
  height: 8%;
  width: 100%;

}


/* .ivu-tabs {
  overflow-y:  auto !important;
} */
/* .ivu-tabs-nav-container {
  font-size: 18px !important;
}
.ivu-dropdown-item {
  font-size: 15px !important;

}
.ivu-tabs-bar {
  margin-bottom: 6px !important;
} */
</style>

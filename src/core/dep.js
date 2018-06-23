/**
 * 用于维护制图参数对象的观察者
 */

export default function Dep() {

  // 观察者列表
  this.subs = [];

}

Object.assign( Dep.prototype, {

  /**
   * 添加观察者
   * @param {ol.Layer} sub 观察数据的openlayers图层对象
   */
  addSub: function( sub ) {
    this.subs.push(sub)
  },

  removeSub: function( sub ) {
    remove(this.subs, sub)
  },

  depend: function() {
    if (Dep.target) {
      Dep.target.addDep(this)
    }
  },

  notify: function() {
    // stabilize the subscriber list first
    const subs = this.subs.slice();
    for (let i = 0, l = subs.length; i < l; i++) {
      subs[i].update();
    }
  }

} )

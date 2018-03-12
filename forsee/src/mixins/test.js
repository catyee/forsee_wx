import wepy from 'wepy'

export default class testMixin extends wepy.mixin {
  // mixin混合可以将组件之间的可复用部分抽离，从而在组件中使用混合时
  // 可以将混合的数据，方法，以及事件注入到组件之中
  // 混合分为两种：默认式混合，兼容式混合
  // 默认
  // 对于组件的data数据，components组件，events事件以及其他自定义方法采用默认式混合，即如果组件未声明该数据，组件，事件
  // 自定义方法等，那么将混合对象中的选项注入到组件之中，对于组件已经声明的选项将不受影响
  data = {
    mixin: 'This is mixin data.',
    test: 'This is mixin test.'
  }
  methods = {
    tap () {
      this.mixin = 'mixin data was changed'
      console.log('mixin method tap')
    }
  }

  onShow() {
    console.log('mixin onShow')
  }

  onLoad() {
    console.log('mixin onLoad')
  }
}

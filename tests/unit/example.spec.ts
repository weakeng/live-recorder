import { expect } from 'chai'
import { shallowMount } from '@vue/test-utils'
import HelloWorld from '@/components/HelloWorld.vue'
import LiveFactory from "@/vendor/live/LiveFactory";

describe('HelloWorld.vue', () => {
  it('renders props.msg when passed',async () => {
    let live= LiveFactory.getLive('https://www.douyu.com/5792609');
    await live.refreshRoomData();
    let res=await live.getLiveUrl();
    console.log(res,live);
    expect('').to.include('')
  })
})
